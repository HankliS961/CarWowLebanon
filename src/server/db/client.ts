/**
 * Re-export Prisma client from the canonical location.
 * Import from here in server-side code for consistency.
 */
export { prisma, default as db } from "@/lib/prisma";
