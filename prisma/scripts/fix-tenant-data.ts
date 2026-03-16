import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data migration for multi-tenancy...");

  // 1. Fix Company Users (Set ownerId = id)
  const companies = await prisma.user.findMany({
    where: { role: "company", ownerId: null },
  });

  console.log(`Found ${companies.length} company users to fix.`);

  for (const company of companies) {
    await prisma.user.update({
      where: { id: company.id },
      data: { ownerId: company.id },
    });
    console.log(`Updated company user: ${company.email}`);

    // 2. Fix their Branch
    if (company.branchId) {
      // Use any to bypass type check if client not generated yet, 
      // but we just generated it so it should be fine.
      await (prisma as any).branch.update({
        where: { id: company.branchId },
        data: { ownerId: company.id },
      });
      console.log(`Updated branch for company: ${company.name}`);
    }
  }

  // 3. Fix Employees (Find their company and set ownerId)
  const employees = await prisma.user.findMany({
    where: { role: "employee", ownerId: null },
  });

  console.log(`Found ${employees.length} employees to fix.`);

  for (const emp of employees) {
    if (emp.branchId) {
      const branch: any = await (prisma as any).branch.findUnique({
        where: { id: emp.branchId },
        select: { ownerId: true },
      });
      if (branch?.ownerId) {
        await prisma.user.update({
          where: { id: emp.id },
          data: { ownerId: branch.ownerId },
        });
        console.log(`Updated employee user: ${emp.email} with ownerId: ${branch.ownerId}`);
      }
    }
  }

  console.log("Data migration completed successfully.");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
