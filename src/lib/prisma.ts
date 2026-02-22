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

if (
  !globalForPrisma.prisma ||
  !("employee" in (globalForPrisma.prisma as any))
) {
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;
