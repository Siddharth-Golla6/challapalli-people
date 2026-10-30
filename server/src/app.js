import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import problemsRoutes from "./routes/problems.js";
import announcementsRoutes from "./routes/announcements.js";
import usersRoutes from "./routes/users.js";
import activityLogRoutes from "./routes/activityLog.js";
import volunteersRoutes from "./routes/volunteers.js";
import suggestionsRoutes from "./routes/suggestions.js";
import feedbackRoutes from "./routes/feedback.js";
import { mongoSanitize } from "./utils/sanitize.js";

// Brute-force / abuse guard for auth endpoints (login, register, OTP send/verify).
// Per-IP, so it's a coarse defense-in-depth layer on top of the per-phone OTP
// cooldown and attempt cap already enforced in routes/auth.js.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts from this device. Please try again later." },
});

// Admin / staff writes also deserve their own rate limit — a stolen JWT with
// Administrator scope would otherwise be able to bulk-delete the panchayat's
// data at line speed. 120/min is generous for real admin usage (a human can't
// realistically moderate faster) and still caps the blast radius of abuse.
const adminWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many admin requests. Please slow down." },
  // Only count mutations; reads stay unmetered so dashboards still refresh fast.
  skip: (req) => req.method === "GET" || req.method === "OPTIONS" || req.method === "HEAD",
});

export function createApp() {
  const app = express();

  // Disable CSP here — this is a JSON API, not a page-serving server, and a
  // default CSP can interfere with clients in ways that aren't useful here.
  app.use(helmet({ contentSecurityPolicy: false }));

  const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean);
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && allowedOrigins.length === 0) {
    // Fail closed, not open — an unset CORS_ORIGIN in production must never
    // silently fall back to "allow any origin" against an authenticated API.
    console.error("CORS_ORIGIN is not set in production — refusing all cross-origin requests until it is.");
  }
  const corsOrigin = allowedOrigins.length ? allowedOrigins : isProduction ? false : true;
  app.use(cors({ origin: corsOrigin }));

  // morgan("dev") is colour-coded for a human in a terminal; "combined" is
  // Apache's standard access-log format for aggregators. Pick based on env
  // so Render's log viewer gets a line Logtail/Datadog can parse without
  // ANSI stripping. Health checks are silenced so they don't drown the log.
  app.use(morgan(isProduction ? "combined" : "dev", {
    skip: (req) => req.path === "/api/health",
  }));
  // Photos are stored as base64 data URIs directly in request bodies, so the
  // default 100kb JSON limit needs raising.
  app.use(express.json({ limit: "15mb" }));
  app.use(mongoSanitize);

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authLimiter, authRoutes);
  // Every write endpoint below goes through the admin/staff limiter; GETs
  // (resident browsing) skip it via the `skip` callback above.
  app.use("/api/problems", adminWriteLimiter, problemsRoutes);
  app.use("/api/announcements", adminWriteLimiter, announcementsRoutes);
  app.use("/api/users", adminWriteLimiter, usersRoutes);
  app.use("/api/activity-log", adminWriteLimiter, activityLogRoutes);
  app.use("/api/volunteers", adminWriteLimiter, volunteersRoutes);
  app.use("/api/suggestions", adminWriteLimiter, suggestionsRoutes);
  app.use("/api/feedback", adminWriteLimiter, feedbackRoutes);

  app.use((req, res) => res.status(404).json({ error: "Not found." }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // Log enough to debug, never secrets — err.message/stack only, no request
    // bodies (which could contain passwords) and no env/config values.
    console.error(err);

    // Prisma error codes: https://www.prisma.io/docs/orm/reference/error-reference
    if (err.code === "P2002") {
      return res.status(409).json({ error: "That record already exists." });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found." });
    }
    if (err.code === "P2003") {
      return res.status(400).json({ error: "That references a record that doesn't exist." });
    }
    if (err.name === "PrismaClientValidationError") {
      return res.status(400).json({ error: "Invalid request data." });
    }
    // Express body-parser emits this when a request exceeds the json() limit
    // above (15mb). Honour the right status code instead of masking it as 500.
    if (err.type === "entity.too.large") {
      return res.status(413).json({ error: "That request is too large. Try fewer or smaller photos." });
    }
    res.status(500).json({ error: "Something went wrong on the server." });
  });

  return app;
}
