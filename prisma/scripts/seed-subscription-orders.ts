/**
 * Seed subscription history for company@example.com (for testing /settings?tab=order).
 * Run from project root: pnpm exec tsx prisma/scripts/seed-subscription-orders.ts
 */
import * as dotenv from "dotenv"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { seedOrders } from "../seeds/orders"

dotenv.config()

const connectionString =
  process.env.DATABASE_URL ??
  (process.env.DB_SOURCE === "neon" ? process.env.DATABASE_URL_NEON : process.env.DATABASE_URL_LOCAL)
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await seedOrders(prisma)
  console.log("Done.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
