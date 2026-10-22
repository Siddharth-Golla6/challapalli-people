// Strips keys that look like MongoDB operators ($ne, $gt, etc.) or contain "."
// from user-controlled input (req.body, req.query, req.params) before it can
// reach a Mongoose query. Without this, a query string like
// "?wardId[$ne]=null" is parsed by Express into { wardId: { $ne: null } }
// and passed straight into Model.find(filter) — a classic NoSQL injection path.
//
// A key whose value is entirely operators (e.g. "?wardId[$ne]=null") is
// dropped altogether rather than left as `{}` — an empty object would still
// reach Mongoose as a real (if harmless) filter value and, against a String
// field, throw a CastError instead of just being ignored.
const NOTHING = Symbol("stripped");

function stripOperators(value) {
  if (Array.isArray(value)) {
    return value.map(stripOperators).filter((v) => v !== NOTHING);
  }
  if (value && typeof value === "object") {
    const clean = {};
    let hasKeys = false;
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      const stripped = stripOperators(val);
      if (stripped === NOTHING) continue;
      clean[key] = stripped;
      hasKeys = true;
    }
    return hasKeys ? clean : NOTHING;
  }
  return value;
}

function sanitize(obj) {
  const result = stripOperators(obj);
  return result === NOTHING ? {} : result;
}

export function mongoSanitize(req, _res, next) {
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  next();
}
