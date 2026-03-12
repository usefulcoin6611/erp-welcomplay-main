/**
 * Seed only contract types (for /pipelines?tab=contract-type).
 * Run: pnpm db:seed:contract-types
 */
import * as dotenv from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const CONTRACT_TYPE_NAMES = [
  "Implementasi",
  "Dukungan & Pemeliharaan",
  "Pengembangan",
  "Migrasi Sistem",
  "Audit & Konsultasi",
  "Pelatihan",
  "Integrasi Sistem",
  "Konsultasi",
];

const connectionString =
  process.env.DATABASE_URL ??
  (process.env.DB_SOURCE === "neon" ? process.env.DATABASE_URL_NEON : process.env.DATABASE_URL_LOCAL);

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  let created = 0;
  for (const name of CONTRACT_TYPE_NAMES) {
    const existing = await prisma.contractType.findFirst({ where: { name } });
    if (existing) continue;
    await prisma.contractType.create({ data: { name } });
    created++;
    console.log(`Contract type created: ${name}`);
  }
  console.log(`Contract types seeding completed. New records: ${created}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
