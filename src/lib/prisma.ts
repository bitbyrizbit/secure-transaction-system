import { PrismaClient } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Global Prisma client singleton
//
// In development, hot-module replacement causes new module instances, which
// would create a new PrismaClient on every reload and exhaust the connection
// pool. We store the instance on the global object to reuse it across reloads.
// ─────────────────────────────────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
