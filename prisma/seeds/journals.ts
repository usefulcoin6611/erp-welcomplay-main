// This function seeds the journal entries using the Prisma client
export async function seedJournals(prisma: any) {
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
  
  // Specific Bank Accounts
  const bcaAccount = await prisma.chartOfAccount.findUnique({ where: { code: "1120" } });
  const midtransAccount = await prisma.chartOfAccount.findUnique({ where: { code: "1123" } });
  const xenditAccount = await prisma.chartOfAccount.findUnique({ where: { code: "1124" } });
  const jagoAccount = await prisma.chartOfAccount.findUnique({ where: { code: "1122" } });

  const customers = await prisma.customer.findMany({
    where: { branchId },
    orderBy: { createdAt: "asc" },
    take: 3,
  });

  const cust1 = customers[0]?.id ?? null;
  const cust2 = customers[1]?.id ?? null;
  const cust3 = customers[2]?.id ?? null;

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
        reference: "JR-MONTHLY-2026-02",
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
        date: new Date("2026-02-05"),
        description: "Invoice payment from PT. Maju Bersama",
        reference: "INV-2026-001",
        amount: 13320000,
        branchId: branchId,
        customerId: cust1,
        lines: {
          create: [
            { accountId: cashAccount.id, debit: 13320000, credit: 0 },
            { accountId: salesAccount.id, debit: 0, credit: 13320000 },
          ],
        },
      },
      {
        journalId: "JR-2026-004",
        date: new Date("2026-02-08"),
        description: "Maintenance service payment from Toko Sinar Jaya",
        reference: "INV-2026-002",
        amount: 9990000,
        branchId: branchId,
        customerId: cust3,
        lines: {
          create: [
            { accountId: cashAccount.id, debit: 9990000, credit: 0 },
            { accountId: salesAccount.id, debit: 0, credit: 9990000 },
          ],
        },
      },
      {
        journalId: "JR-2026-005",
        date: new Date("2026-02-12"),
        description: "Consulting fee from Bapak Budi Santoso",
        reference: "RCPT-2026-005",
        amount: 2500000,
        branchId: branchId,
        customerId: cust2,
        lines: {
          create: [
            { accountId: cashAccount.id, debit: 2500000, credit: 0 },
            { accountId: salesAccount.id, debit: 0, credit: 2500000 },
          ],
        },
      },
      {
        journalId: "JR-2026-006",
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
      // New specific transactions
      ...(bcaAccount ? [{
        journalId: "JR-2026-007",
        date: new Date("2026-02-15"),
        description: "Direct Transfer to BCA",
        reference: "TRF-BCA-001",
        amount: 15000000,
        branchId: branchId,
        customerId: cust1,
        lines: {
          create: [
            { accountId: bcaAccount.id, debit: 15000000, credit: 0 },
            { accountId: salesAccount.id, debit: 0, credit: 15000000 },
          ],
        },
      }] : []),
      ...(midtransAccount ? [{
        journalId: "JR-2026-008",
        date: new Date("2026-02-16"),
        description: "Payment via Midtrans VA",
        reference: "MID-VA-001",
        amount: 5500000,
        branchId: branchId,
        customerId: cust2,
        lines: {
          create: [
            { accountId: midtransAccount.id, debit: 5500000, credit: 0 },
            { accountId: salesAccount.id, debit: 0, credit: 5500000 },
          ],
        },
      }] : []),
      ...(xenditAccount ? [{
        journalId: "JR-2026-009",
        date: new Date("2026-02-17"),
        description: "Payment via Xendit VA",
        reference: "XEN-VA-001",
        amount: 7250000,
        branchId: branchId,
        customerId: cust3,
        lines: {
          create: [
            { accountId: xenditAccount.id, debit: 7250000, credit: 0 },
            { accountId: salesAccount.id, debit: 0, credit: 7250000 },
          ],
        },
      }] : []),
      ...(jagoAccount ? [{
        journalId: "JR-2026-010",
        date: new Date("2026-02-18"),
        description: "Payment via Jago VA",
        reference: "JAGO-VA-001",
        amount: 3000000,
        branchId: branchId,
        customerId: cust1,
        lines: {
          create: [
            { accountId: jagoAccount.id, debit: 3000000, credit: 0 },
            { accountId: salesAccount.id, debit: 0, credit: 3000000 },
          ],
        },
      }] : []),
    ];

    for (const entry of journalEntries) {
      await prisma.journalEntry.upsert({
        where: { journalId: entry.journalId },
        update: {
          date: entry.date,
          description: entry.description,
          reference: (entry as any).reference ?? null,
          amount: entry.amount,
          customerId: (entry as any).customerId ?? null,
        },
        create: {
          journalId: entry.journalId,
          date: entry.date,
          description: entry.description,
          reference: (entry as any).reference ?? null,
          amount: entry.amount,
          customer: (entry as any).customerId
            ? { connect: { id: (entry as any).customerId } }
            : undefined,
          branch: { connect: { id: branchId } },
          lines: entry.lines,
        },
      });
    }
    console.log("Journal Entries seeded.");
  } else {
    console.warn("Could not find required accounts for journal entry seeding.");
  }
}
