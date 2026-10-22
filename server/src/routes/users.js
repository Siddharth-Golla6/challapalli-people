import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { ROLE_OPTIONS } from "../constants.js";
import { WARDS } from "../data/geography.js";
import { toSafeUser } from "../utils/safeUser.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth, requireAdmin, requireAdministrator } from "../middleware/auth.js";

const router = Router();
const WARD_IDS = WARDS.map((m) => m.id);

// A Ward Admin can see and manage residents/volunteers, but Administrator
// accounts are the top permission level and stay invisible to anyone below
// that — not just protected from edits (see the role/delete restrictions
// further down), but omitted from the list entirely.
router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const isSelfAdministrator = req.user.role === "Administrator";
    const users = await prisma.user.findMany({
      where: isSelfAdministrator ? {} : { role: { not: "Administrator" } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users: users.map(toSafeUser) });
  })
);

// Only an Administrator can grant the Administrator role, or change the role of
// an existing Administrator — a Ward Admin (also allowed past requireAdmin
// above) must not be able to promote anyone to, or demote anyone from, the
// top permission level.
//
// Assigning the Volunteer role also assigns a Ward (required — a volunteer
// scoped to nothing isn't useful) and keeps the `volunteers` leaderboard
// table in sync: a linked row is created/moved when someone becomes a
// Volunteer, and removed if they stop being one.
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { role, wardId } = req.body;
    if (!role || !ROLE_OPTIONS.includes(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }
    if (role === "Volunteer" && !WARD_IDS.includes(wardId)) {
      return res.status(400).json({ error: "Choose a Ward for this volunteer." });
    }

    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: "User not found." });

    const isSelfAdministrator = req.user.role === "Administrator";
    if ((role === "Administrator" || target.role === "Administrator") && !isSelfAdministrator) {
      return res.status(403).json({ error: "You don't have permission to do that." });
    }

    const wasVolunteer = target.role === "Volunteer";
    const isNowVolunteer = role === "Volunteer";

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { role, ...(isNowVolunteer ? { wardId } : {}) },
    });

    if (isNowVolunteer) {
      // Upsert-by-userId: keep resolved/points if they already had a
      // volunteer record (e.g. just moving Wards), otherwise start fresh.
      const existing = await prisma.volunteer.findUnique({ where: { userId: target.id } });
      if (existing) {
        await prisma.volunteer.update({
          where: { userId: target.id },
          data: { name: updated.name, wardId },
        });
      } else {
        await prisma.volunteer.create({
          data: { name: updated.name, wardId, userId: target.id },
        });
      }
    } else if (wasVolunteer) {
      await prisma.volunteer.deleteMany({ where: { userId: target.id } });
    }

    res.json({ user: toSafeUser(updated) });
  })
);

// Administrator-only — a Ward Admin can no longer reset another user's
// password. Resetting a password is full account takeover for that user, and
// that's more power than "manage residents in my Ward" should include.
router.patch(
  "/:id/password",
  requireAuth,
  requireAdministrator,
  asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password should be at least 6 characters." });
    }

    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: "User not found." });

    const passwordHash = await bcrypt.hash(password, 10);
    // tokenVersion++ signs out every session already issued for this account —
    // the same reason the self-service reset does it. Without this, a reason
    // to force-reset someone's password (e.g. a suspected compromise) wouldn't
    // actually revoke whatever session the attacker already holds.
    await prisma.user.update({
      where: { id: target.id },
      data: { passwordHash, tokenVersion: { increment: 1 } },
    });
    res.status(204).end();
  })
);

router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "You can't remove your own account." });
    }

    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ error: "User not found." });
    if (target.role === "Administrator" && req.user.role !== "Administrator") {
      return res.status(403).json({ error: "You don't have permission to do that." });
    }

    await prisma.user.delete({ where: { id: target.id } });
    res.status(204).end();
  })
);

export default router;
