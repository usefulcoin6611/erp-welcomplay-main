/**
 * One-off script: set company@example.com to Gold plan for testing.
 * Run from project root: pnpm exec tsx prisma/scripts/set-company-gold-plan.ts
 */
import * as dotenv from "dotenv"
import { Pool } from "pg"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

dotenv.config()

const connectionString =
  process.env.DATABASE_URL ??
  (process.env.DB_SOURCE === "neon" ? process.env.DATABASE_URL_NEON : process.env.DATABASE_URL_LOCAL)
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const expire = new Date()
  expire.setFullYear(expire.getFullYear() + 1)

  const updated = await prisma.user.updateMany({
    where: { email: "company@example.com" },
    data: { plan: "Gold", planExpireDate: expire },
  })

  console.log(
    updated.count > 0
      ? `Updated company@example.com to Gold plan (expires ${expire.toISOString().slice(0, 10)}).`
      : "No user found with email company@example.com."
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
