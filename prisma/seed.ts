import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import { seedCOA } from "./seeds/coa";
import { seedUsers } from "./seeds/users";
import { seedJournals } from "./seeds/journals";
import { seedBranches } from "./seeds/branches";
import { seedDepartments } from "./seeds/departments";
import { seedDesignations } from "./seeds/designations";
import { seedLeaveTypes } from "./seeds/leave-types";
import { seedDocumentTypes } from "./seeds/document-types";
import { seedPayslipTypes } from "./seeds/payslip-types";
import { seedAllowanceOptions } from "./seeds/allowance-options";
import { seedLoanOptions } from "./seeds/loan-options";
import { seedDeductionOptions } from "./seeds/deduction-options";
import { seedCustomers } from "./seeds/customers";
import { seedVendors } from "./seeds/vendors";
import { seedEstimates } from "./seeds/estimates";
import { seedTaxes } from "./seeds/taxes";
import { seedUnits } from "./seeds/units";
import { seedCategories } from "./seeds/categories";
import { seedCustomFields } from "./seeds/custom-fields";
import { seedProducts } from "./seeds/products";
import { seedInvoices } from "./seeds/invoices";
import { seedBills } from "./seeds/bills";
import { seedCreditNotes } from "./seeds/credit-notes";
import { seedBankAccounts } from "./seeds/bank-accounts";
import { seedBankTransfers } from "./seeds/bank-transfers";
import { seedExpenses } from "./seeds/expenses";
import { seedPayments } from "./seeds/payments";
import { seedDebitNotes } from "./seeds/debit-notes";
import { seedFinancialGoals } from "./seeds/financial-goals";
import { seedBudgets } from "./seeds/budgets";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const { PrismaClient } = pkg as any;
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    await seedBranches(prisma);
    await seedDepartments(prisma);
    await seedDesignations(prisma);
    await seedLeaveTypes(prisma);
    await seedDocumentTypes(prisma);
    await seedPayslipTypes(prisma);
    await seedAllowanceOptions(prisma);
    await seedLoanOptions(prisma);
    await seedDeductionOptions(prisma);
    await seedCOA(prisma);
    await seedUsers(prisma);
    await seedTaxes(prisma);
    await seedUnits(prisma);
    await seedCategories(prisma);
    await seedCustomers(prisma);
    await seedJournals(prisma);
    await seedVendors(prisma);
    await seedCustomFields(prisma);
    await seedProducts(prisma);
    await seedEstimates(prisma);
    await seedInvoices(prisma);
    await seedBills(prisma);
    await seedExpenses(prisma);
    await seedCreditNotes(prisma);
    await seedBankAccounts(prisma);
    await seedBankTransfers(prisma);
    await seedPayments(prisma);
    await seedDebitNotes(prisma);
    await seedFinancialGoals(prisma);
    await seedBudgets(prisma);
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
