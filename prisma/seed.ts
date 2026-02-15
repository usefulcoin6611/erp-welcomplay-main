import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { seedCOA } from "./seeds/coa";
import { seedUsers } from "./seeds/users";
import { seedJournals } from "./seeds/journals";
import { seedBranches } from "./seeds/branches";
import { seedCustomers } from "./seeds/customers";
import { seedEstimates } from "./seeds/estimates";
import { seedTaxes } from "./seeds/taxes";
import { seedUnits } from "./seeds/units";
import { seedCategories } from "./seeds/categories";
import { seedCustomFields } from "./seeds/custom-fields";
import { seedProducts } from "./seeds/products";
import { seedInvoices } from "./seeds/invoices";
import { seedCreditNotes } from "./seeds/credit-notes";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    await seedBranches(prisma);
    await seedCOA(prisma);
    await seedUsers(prisma);
    await seedJournals(prisma);
    await seedCustomers(prisma);
    await seedEstimates(prisma);
    await seedTaxes(prisma);
    await seedUnits(prisma);
    await seedCategories(prisma);
    await seedCustomFields(prisma);
    await seedProducts(prisma);
    await seedInvoices(prisma);
    await seedCreditNotes(prisma);
    console.log("Full seeding process completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
