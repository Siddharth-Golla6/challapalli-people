// Validates the one exception to "every photo gets re-encoded through
// sharp": the themed placeholder SVG the frontend generates when a report
// has no real photo (src/utils/placeholderImage.js). That generator always
// percent-encodes its output via encodeURIComponent, so a legitimate
// placeholder can never contain a raw `<`, `>`, `"`, or space. Checking only
// the "data:image/svg+xml;utf8," prefix (as this used to) let a client send
// arbitrary unencoded SVG content instead — up to the size cap, completely
// bypassing the re-encoding guarantee, with no check on what that content
// actually was.
const SVG_PLACEHOLDER_PATTERN = /^data:image\/svg\+xml;utf8,([A-Za-z0-9%\-_.!~*'()]+)$/;
const DANGEROUS_SVG_PATTERN = /<script|on\w+\s*=|javascript:|xlink:href|<\s*iframe|<\s*foreignobject/i;
const MAX_DECODED_LENGTH = 20000; // real placeholders are ~1-2KB; generous but bounded

export function isSafeSvgPlaceholder(value) {
  if (typeof value !== "string") return false;
  const match = SVG_PLACEHOLDER_PATTERN.exec(value);
  if (!match) return false;

  let decoded;
  try {
    decoded = decodeURIComponent(match[1]);
  } catch {
    return false;
  }

  if (decoded.length > MAX_DECODED_LENGTH) return false;
  if (!/^<svg[\s>]/i.test(decoded.trim())) return false;
  if (DANGEROUS_SVG_PATTERN.test(decoded)) return false;
  return true;
}
