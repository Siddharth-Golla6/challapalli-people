// Seeds a fresh database with ONLY the four demo accounts that let a new
// deployment be logged into on day one. Everything else (problems,
// suggestions, feedback, announcements, volunteers, activity log) is left
// empty on purpose — real residents will fill the platform with real data.
//
// Run with: npm run seed  (requires DATABASE_URL / DIRECT_URL to point at
// a real Postgres database — Supabase in production).

import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./config/prisma.js";
import { WARDS, PANCHAYAT } from "./data/geography.js";

// Fixed, published demo password. Safe only because every account below
// is explicitly a demo seed. ROTATE this immediately — through
// `PATCH /api/users/:id/password` or the Admin dashboard — once a real
// panchayat team takes over.
const DEMO_PASSWORD = "demo1234";

const wardAt = (i) => WARDS[i].id;

async function seed() {
  console.log(`Clearing existing data from ${PANCHAYAT.name}...`);
  // Children-before-parents order. The schema's cascading deletes handle
  // the deeper per-problem/per-user child rows automatically.
  await prisma.problem.deleteMany({});
  await prisma.volunteer.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.suggestion.deleteMany({});
  await prisma.feedback.deleteMany({});
  await prisma.otpCode.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  console.log("Seeding demo accounts (four roles)...");
  const DEMO_USERS = [
    { name: "R. Narayana",     phone: "9876500001", role: "Resident",      wardId: wardAt(0) },
    { name: "V. Ramesh",       phone: "9876500002", role: "Volunteer",     wardId: wardAt(0) },
    { name: "Ch. Ravi Teja",   phone: "9876500004", role: "Ward Admin",    wardId: wardAt(2) },
    { name: "Administrator",   phone: "9876500000", role: "Administrator", wardId: null },
  ];

  for (const u of DEMO_USERS) {
    await prisma.user.create({ data: { ...u, passwordHash } });
  }

  console.log(`\nDone. ${DEMO_USERS.length} accounts seeded, password: ${DEMO_PASSWORD}`);
  console.log("Everything else (problems, suggestions, feedback, announcements)");
  console.log("is intentionally empty — residents will create their own.\n");

  for (const u of DEMO_USERS) {
    console.log(`  ${u.role.padEnd(14)} ${u.phone}`);
  }

  await prisma.$disconnect();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});
