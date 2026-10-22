import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const entries = await prisma.activityLog.findMany({ orderBy: { date: "desc" }, take: 200 });
    res.json({ entries });
  })
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { action } = req.body;
    if (!action?.trim()) return res.status(400).json({ error: "Action text is required." });
    const entry = await prisma.activityLog.create({
      data: { actor: req.user.name, action: action.trim(), date: new Date() },
    });
    res.status(201).json({ entry });
  })
);

export default router;
