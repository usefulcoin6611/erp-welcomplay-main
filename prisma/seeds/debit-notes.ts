export async function seedDebitNotes(prisma: any) {
  console.log("Seeding Debit Notes...");

  // Get Bills from existing seeded data (BILL-2026-001 to BILL-2026-004)
  const bill1 = await prisma.bill.findUnique({ where: { billId: "BILL-2026-001" } });
  const bill2 = await prisma.bill.findUnique({ where: { billId: "BILL-2026-002" } });
  const bill3 = await prisma.bill.findUnique({ where: { billId: "BILL-2026-003" } });
  const bill4 = await prisma.bill.findUnique({ where: { billId: "BILL-2026-004" } });

  if (!bill1 || !bill2 || !bill3 || !bill4) {
    console.log("Skipping debit note seed: required bills not found.");
    return;
  }

  type SeedRow = {
    number: number;
    billId: string;
    date: Date;
    amount: number;
    description: string;
    status: number; // 0: Pending, 1: Partially Used, 2: Fully Used
  };

  const rows: SeedRow[] = [
    {
      number: 1,
      billId: bill1.billId,
      date: new Date("2026-02-12"),
      amount: 500000,
      description: "Return of damaged paper goods",
      status: 0,
    },
    {
      number: 2,
      billId: bill2.billId,
      date: new Date("2026-02-15"),
      amount: 750000,
      description: "Refund for late delivery penalty",
      status: 1,
    },
    {
      number: 3,
      billId: bill3.billId,
      date: new Date("2026-02-20"),
      amount: 150000,
      description: "Price adjustment for IT support",
      status: 2,
    },
    {
      number: 4,
      billId: bill1.billId,
      date: new Date("2026-02-25"),
      amount: 250000,
      description: "Discount for bulk ink purchase",
      status: 0,
    },
  ];

  for (const row of rows) {
    const exists = await (prisma as any).debitNote.findFirst({
      where: {
        number: row.number,
        billId: row.billId,
      },
    });

    if (exists) {
      console.log(`Debit note exists: #DN${row.number.toString().padStart(5, "0")} for ${row.billId}`);
      continue;
    }

    await (prisma as any).debitNote.create({
      data: {
        number: row.number,
        billId: row.billId,
        date: row.date,
        amount: row.amount,
        description: row.description,
        status: row.status,
      },
    });

    console.log(`Debit note seeded: #DN${row.number.toString().padStart(5, "0")} for ${row.billId}`);
  }

  console.log("Debit Notes seeding completed.");
}
