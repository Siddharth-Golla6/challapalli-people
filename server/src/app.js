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

  app.use(morgan("dev"));
  // Photos are stored as base64 data URIs directly in request bodies, so the
  // default 100kb JSON limit needs raising.
  app.use(express.json({ limit: "15mb" }));
  app.use(mongoSanitize);

  app.get("/api/health", (req, res) => res.json({ ok: true }));

  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/problems", problemsRoutes);
  app.use("/api/announcements", announcementsRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/activity-log", activityLogRoutes);
  app.use("/api/volunteers", volunteersRoutes);
  app.use("/api/suggestions", suggestionsRoutes);
  app.use("/api/feedback", feedbackRoutes);

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
    res.status(500).json({ error: "Something went wrong on the server." });
  });

  return app;
}
