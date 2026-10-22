import { Router } from "express";
import { prisma } from "../config/prisma.js";
import { Prisma } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { sendSms } from "../services/sms.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const announcements = await prisma.announcement.findMany({ orderBy: { date: "desc" } });
    res.json({ announcements });
  })
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { title, body, wardId } = req.body;
    if (!title?.trim() || !body?.trim()) {
      return res.status(400).json({ error: "Title and message are required." });
    }
    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        body: body.trim(),
        wardId: wardId || null,
        postedById: req.user.id,
        date: new Date(),
      },
    });
    res.status(201).json({ announcement });

    // Broadcast — best-effort, doesn't block the response above. Scoped to the
    // announcement's Ward when one is set, otherwise every resident/volunteer.
    const recipients = await prisma.user.findMany({
      where: {
        role: { in: ["Resident", "Volunteer"] },
        ...(wardId ? { wardId } : {}),
      },
      select: { phone: true, preferredLanguage: true },
    });
    recipients.forEach((recipient) => {
      sendSms({
        to: recipient.phone,
        templateKey: "announcement",
        params: { title: announcement.title },
        language: recipient.preferredLanguage,
      });
    });
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      await prisma.announcement.delete({ where: { id: req.params.id } });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return res.status(404).json({ error: "Announcement not found." });
      }
      throw err;
    }
    res.status(204).end();
  })
);

export default router;
