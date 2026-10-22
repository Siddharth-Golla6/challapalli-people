// Uploads problem photos to Cloudflare R2 (S3-compatible object storage)
// instead of storing them inline in MongoDB. Every real photo is resized and
// recompressed server-side with sharp before upload — the frontend already
// compresses on its end (src/utils/compressImage.js), but that's just UX
// (smaller upload, faster form); this is the actual guarantee, since a
// client can always be bypassed.

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import crypto from "crypto";
import { isSafeSvgPlaceholder } from "../utils/svgPlaceholder.js";

const BASE64_IMAGE_PATTERN = /^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/;

let client = null;
function getClient() {
  if (client) return client;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 is not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY."
    );
  }

  client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

// Uploads one photo (a base64 data URI) to R2, returning its public URL.
export async function uploadPhoto(dataUri, { keyPrefix = "photos" } = {}) {
  // Only the exact, safely-encoded themed placeholder passes through
  // unchanged — anything else is a real photo and always gets re-encoded
  // through sharp below, regardless of what content type it claims to be.
  if (isSafeSvgPlaceholder(dataUri)) return dataUri;

  const match = BASE64_IMAGE_PATTERN.exec(dataUri);
  if (!match) throw new Error("Unsupported photo format.");

  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrlBase = process.env.R2_PUBLIC_URL;
  if (!bucket) throw new Error("R2_BUCKET_NAME is not set.");
  if (!publicUrlBase) throw new Error("R2_PUBLIC_URL is not set.");

  const inputBuffer = Buffer.from(match[2], "base64");
  const compressed = await sharp(inputBuffer)
    .rotate() // respects EXIF orientation before resizing/stripping metadata
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 75, mozjpeg: true })
    .toBuffer();

  const key = `${keyPrefix}/${Date.now()}-${crypto.randomUUID()}.jpg`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: compressed,
      ContentType: "image/jpeg",
    })
  );

  return `${publicUrlBase.replace(/\/$/, "")}/${key}`;
}

// Uploads a list of photos in parallel, preserving order.
export async function uploadPhotos(dataUris, options) {
  return Promise.all(dataUris.map((uri) => uploadPhoto(uri, options)));
}
