import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

export function getPrisma() {
  if (!prisma) {
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL is not set. Database operations will fail.');
    }
    prisma = new PrismaClient();
  }
  return prisma;
}
