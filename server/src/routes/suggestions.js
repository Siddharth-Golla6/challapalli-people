import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth.js";
import { WARDS } from "../data/geography.js";

const router = Router();

const SUGG_CATEGORY_OPTIONS = [
  "Infrastructure",
  "Public Services",
  "Health & Sanitation",
  "Education",
  "Environment",
  "Culture & Events",
  "Governance",
  "Other",
];
const SUGG_STATUS_OPTIONS = ["Submitted", "Under Review", "Accepted", "Rejected", "Implemented"];

const WARD_IDS = WARDS.map((w) => w.id);
const wardName = (id) => WARDS.find((w) => w.id === id)?.name;

const STAFF_ROLES = ["Volunteer", "Ward Admin", "Administrator"];
const isStaff = (user) => Boolean(user && STAFF_ROLES.includes(user.role));

function toSuggestionJSON(s, { includeContact = false } = {}) {
  return {
    id: s.id,
    referenceId: s.referenceId,
    title: s.title,
    description: s.description,
    category: s.category,
    wardId: s.wardId,
    wardName: s.wardName,
    status: s.status,
    moderationNote: s.moderationNote,
    supportCount: s.supportCount,
    submittedByName: includeContact ? s.submittedByName : null,
    submittedByPhone: includeContact ? s.submittedByPhone : null,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

async function generateRef() {
  // Monotonic enough for display — looks up the current max referenceId.
  const latest = await prisma.suggestion.findFirst({ orderBy: { referenceId: "desc" } });
  const nextN = latest ? Number(latest.referenceId.replace("SG-", "")) + 1 : 1;
  return `SG-${String(nextN).padStart(5, "0")}`;
}

router.get(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { wardId, status, category } = req.query;
    const where = {};
    if (wardId) where.wardId = wardId;
    if (status) where.status = status;
    if (category) where.category = category;
    const staff = isStaff(req.user);
    const rows = await prisma.suggestion.findMany({ where, orderBy: { createdAt: "desc" } });
    res.json({ suggestions: rows.map((s) => toSuggestionJSON(s, { includeContact: staff })) });
  })
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title, description, category, wardId } = req.body;
    if (!title?.trim() || !description?.trim() || !category || !wardId) {
      return res.status(400).json({ error: "Title, description, category, and Ward are required." });
    }
    if (!SUGG_CATEGORY_OPTIONS.includes(category)) {
      return res.status(400).json({ error: "Invalid category." });
    }
    if (!WARD_IDS.includes(wardId)) {
      return res.status(400).json({ error: "Invalid Ward." });
    }
    const referenceId = await generateRef();
    const row = await prisma.suggestion.create({
      data: {
        referenceId,
        title: title.trim(),
        description: description.trim(),
        category,
        wardId,
        wardName: wardName(wardId),
        submittedById: req.user.id,
        submittedByName: req.user.name,
        submittedByPhone: req.user.phone,
      },
    });
    res.status(201).json({ suggestion: toSuggestionJSON(row, { includeContact: true }) });
  })
);

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { status, moderationNote } = req.body;
    const data = {};
    if (status !== undefined) {
      if (!SUGG_STATUS_OPTIONS.includes(status)) return res.status(400).json({ error: "Invalid status." });
      data.status = status;
    }
    if (moderationNote !== undefined) data.moderationNote = moderationNote;

    try {
      const row = await prisma.suggestion.update({ where: { id: req.params.id }, data });
      res.json({ suggestion: toSuggestionJSON(row, { includeContact: true }) });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return res.status(404).json({ error: "Suggestion not found." });
      }
      throw err;
    }
  })
);

router.post(
  "/:id/upvote",
  requireAuth,
  asyncHandler(async (req, res) => {
    try {
      const row = await prisma.suggestion.update({
        where: { id: req.params.id },
        data: { supportCount: { increment: 1 } },
      });
      res.json({ suggestion: toSuggestionJSON(row, { includeContact: isStaff(req.user) }) });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return res.status(404).json({ error: "Suggestion not found." });
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
      await prisma.suggestion.delete({ where: { id: req.params.id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return res.status(404).json({ error: "Suggestion not found." });
      }
      throw err;
    }
    res.status(204).end();
  })
);

export default router;
