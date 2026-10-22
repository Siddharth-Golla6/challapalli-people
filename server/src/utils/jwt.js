import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, tokenVersion: user.tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: "30d",
    algorithm: "HS256",
  });
}

export function verifyToken(token) {
  // Pin the algorithm explicitly rather than trusting whatever's in the
  // token's own header — without this, jsonwebtoken infers it from the key
  // type, which is a real algorithm-confusion attack surface the moment an
  // asymmetric key path ever gets added here.
  return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
}
