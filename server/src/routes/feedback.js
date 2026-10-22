import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth.js";
import { WARDS } from "../data/geography.js";

const router = Router();

const FEEDBACK_TOPIC_OPTIONS = [
  "Community Services",
  "Government Initiatives",
  "Website Experience",
  "General Appreciation",
  "Other",
];
const WARD_IDS = WARDS.map((w) => w.id);

const STAFF_ROLES = ["Volunteer", "Ward Admin", "Administrator"];
const isStaff = (user) => Boolean(user && STAFF_ROLES.includes(user.role));

function toFeedbackJSON(f, { admin = false } = {}) {
  const publicContact = f.shareContact && f.isPublic;
  return {
    id: f.id,
    referenceId: f.referenceId,
    topic: f.topic,
    message: f.message,
    rating: f.rating,
    wardId: f.wardId,
    isPublic: f.isPublic,
    shareContact: f.shareContact,
    submittedByName: admin || publicContact ? f.submittedByName : null,
    submittedByPhone: admin ? f.submittedByPhone : null,
    response: f.response,
    respondedAt: f.respondedAt,
    createdAt: f.createdAt,
  };
}

async function generateRef() {
  const latest = await prisma.feedback.findFirst({ orderBy: { referenceId: "desc" } });
  const nextN = latest ? Number(latest.referenceId.replace("FB-", "")) + 1 : 1;
  return `FB-${String(nextN).padStart(5, "0")}`;
}

// Public endpoint — residents and anonymous visitors only see public feedback,
// and only ever see submitter contact details when the submitter explicitly
// allowed it (shareContact + isPublic).
router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const staff = isStaff(req.user);
    const where = staff ? {} : { isPublic: true };
    const rows = await prisma.feedback.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json({ feedback: rows.map((f) => toFeedbackJSON(f, { admin: staff })) });
  })
);

router.post(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { topic, message, rating, wardId, shareContact, isPublic, name, phone } = req.body;
    if (!topic || !message?.trim()) {
      return res.status(400).json({ error: "Topic and message are required." });
    }
    if (!FEEDBACK_TOPIC_OPTIONS.includes(topic)) {
      return res.status(400).json({ error: "Invalid topic." });
    }
    if (wardId && !WARD_IDS.includes(wardId)) {
      return res.status(400).json({ error: "Invalid Ward." });
    }
    if (rating !== undefined && rating !== null && rating !== "") {
      const r = Number(rating);
      if (!Number.isInteger(r) || r < 1 || r > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5." });
      }
    }
    const referenceId = await generateRef();
    const row = await prisma.feedback.create({
      data: {
        referenceId,
        topic,
        message: message.trim(),
        rating: rating ? Number(rating) : null,
        wardId: wardId || null,
        shareContact: Boolean(shareContact),
        isPublic: Boolean(isPublic),
        submittedById: req.user?.id || null,
        submittedByName: (name || req.user?.name || "").trim() || null,
        submittedByPhone: (phone || req.user?.phone || "").trim() || null,
      },
    });
    res.status(201).json({ feedback: toFeedbackJSON(row, { admin: true }) });
  })
);

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { isPublic, response } = req.body;
    const data = {};
    if (isPublic !== undefined) data.isPublic = Boolean(isPublic);
    if (response !== undefined) {
      data.response = response;
      data.respondedAt = response ? new Date() : null;
    }
    try {
      const row = await prisma.feedback.update({ where: { id: req.params.id }, data });
      res.json({ feedback: toFeedbackJSON(row, { admin: true }) });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return res.status(404).json({ error: "Feedback not found." });
      }
      throw err;
    }
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      await prisma.feedback.delete({ where: { id: req.params.id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return res.status(404).json({ error: "Feedback not found." });
      }
      throw err;
    }
    res.status(204).end();
  })
);

export default router;
