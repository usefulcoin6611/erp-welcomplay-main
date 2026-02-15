import { PrismaClient } from "@prisma/client";

// This function seeds the journal entries using the Prisma client
export async function seedJournals(prisma: PrismaClient) {
  console.log("Seeding Journal Entries...");

  // Get a branch to associate with journal entries
  const branch = await prisma.branch.findFirst();
  if (!branch) {
    console.warn("No branch found, skipping Journal Entry seeding.");
    return;
  }

  const branchId = branch.id;

  // Get some accounts for journal entries
  const cashAccount = await prisma.chartOfAccount.findUnique({ where: { code: "1060" } }); // Checking Account
  const arAccount = await prisma.chartOfAccount.findUnique({ where: { code: "1050" } }); // Accounts Receivable
  const salesAccount = await prisma.chartOfAccount.findUnique({ where: { code: "4010" } }); // Sales Income
  const salaryAccount = await prisma.chartOfAccount.findUnique({ where: { code: "5410" } }); // Salaries and Wages
  const openingBalanceAccount = await prisma.chartOfAccount.findUnique({ where: { code: "3020" } }); // Opening Balances

  if (cashAccount && arAccount && salesAccount && salaryAccount && openingBalanceAccount) {
    const journalEntries = [
      {
        journalId: "JR-2026-001",
        date: new Date("2026-01-01"),
        description: "Opening balances for all accounts",
        amount: 500000000,
        branchId: branchId,
        lines: {
          create: [
            { accountId: cashAccount.id, debit: 500000000, credit: 0 },
            { accountId: openingBalanceAccount.id, debit: 0, credit: 500000000 },
          ],
        },
      },
      {
        journalId: "JR-2026-002",
        date: new Date("2026-02-01"),
        description: "Monthly Sales Recognition",
        amount: 75000000,
        branchId: branchId,
        lines: {
          create: [
            { accountId: arAccount.id, debit: 75000000, credit: 0 },
            { accountId: salesAccount.id, debit: 0, credit: 75000000 },
          ],
        },
      },
      {
        journalId: "JR-2026-003",
        date: new Date("2026-02-10"),
        description: "Salary Payment February",
        amount: 25000000,
        branchId: branchId,
        lines: {
          create: [
            { accountId: salaryAccount.id, debit: 25000000, credit: 0 },
            { accountId: cashAccount.id, debit: 0, credit: 25000000 },
          ],
        },
      },
    ];

    for (const entry of journalEntries) {
      await prisma.journalEntry.upsert({
        where: { journalId: entry.journalId },
        update: {},
        create: entry,
      });
    }
    console.log("Journal Entries seeded.");
  } else {
    console.warn("Could not find required accounts for journal entry seeding.");
  }
}
