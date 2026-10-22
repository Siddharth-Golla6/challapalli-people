import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function connectDB() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — copy .env.example to .env and fill it in.");
  }
  await prisma.$connect();
  console.log("Postgres connected (Supabase)");
}
