import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

const connectionString =
  process.env.DATABASE_URL ??
  (process.env.DB_SOURCE === "neon"
    ? process.env.DATABASE_URL_NEON
    : process.env.DATABASE_URL_LOCAL);

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

function createPrismaClient() {
  return new PrismaClient({ adapter });
}

// Invalidate cached client if it lacks new models (schema was updated)
const requiredModels = ["leaveRequest", "employeeAllowance", "hrmAward"];
if (globalForPrisma.prisma) {
  const missing = requiredModels.filter((m) => !(m in (globalForPrisma.prisma as any)));
  if (missing.length > 0) {
    void (globalForPrisma.prisma as any).$disconnect?.();
    globalForPrisma.prisma = undefined;
  }
}

if (
  !globalForPrisma.prisma ||
  !("employee" in (globalForPrisma.prisma as any)) ||
  !("job" in (globalForPrisma.prisma as any)) ||
  !("jobApplication" in (globalForPrisma.prisma as any))
) {
  globalForPrisma.prisma = createPrismaClient();
}

export const prisma = globalForPrisma.prisma;
