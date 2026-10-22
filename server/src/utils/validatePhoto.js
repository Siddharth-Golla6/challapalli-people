// Uploaded photos are base64 data URIs (see app.js's 15mb JSON limit). The
// frontend also falls back to an inline UTF-8-encoded SVG placeholder
// (src/utils/placeholderImage.js) when a report has no real photo — both
// forms need to be accepted here.
import { isSafeSvgPlaceholder } from "./svgPlaceholder.js";

const BASE64_IMAGE_PATTERN = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/]+=*$/;

// Without this check, any string up to the body-size limit — not necessarily
// an image — gets stored and later rendered in an <img src>, which is a
// needless soft spot.
export function isValidPhotoDataUri(value) {
  if (typeof value !== "string" || value.length > 8 * 1024 * 1024) return false;
  return BASE64_IMAGE_PATTERN.test(value) || isSafeSvgPlaceholder(value);
}
