// Security-question answers shouldn't fail verification over casing or
// incidental whitespace differences between what was set at registration
// and what's typed back in during a reset — normalize both sides the same
// way before hashing/comparing.
export function normalizeAnswer(answer) {
  return String(answer || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}
