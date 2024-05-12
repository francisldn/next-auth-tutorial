import { PrismaClient } from "@prisma/client";
declare global {
  var prisma: PrismaClient | undefined;
}

// store the database connection in a global variable so that it is not affected by Nextjs hot reloading
export const db = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
