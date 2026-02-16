export async function seedBankTransfers(prisma: any) {
  console.log("Seeding Bank Transfers...");
  const branch = await prisma.branch.findFirst({ orderBy: { createdAt: "asc" } });
  const branchId = branch?.id ?? null;

  const operating = await prisma.bankAccount.findFirst({
    where: { accountNumber: "1234567890" },
  });

  const pettyCash = await prisma.bankAccount.findFirst({
    where: { accountNumber: "998877665544" },
  });

  const midtransVa = await prisma.bankAccount.findFirst({
    where: { accountNumber: "VA-8877-1234-9999" },
  });

  const xenditVa = await prisma.bankAccount.findFirst({
    where: { accountNumber: "VA-1234-5678-9999" },
  });

  if (!operating || !pettyCash || !midtransVa || !xenditVa) {
    console.log("Skipping Bank Transfers seed: required bank accounts not found.");
    return;
  }

  const rows = [
    {
      date: new Date("2026-02-05"),
      fromAccountId: operating.id,
      toAccountId: pettyCash.id,
      amount: 5_000_000,
      reference: "TRF-2026-001",
      description: "Transfer to petty cash",
    },
    {
      date: new Date("2026-02-10"),
      fromAccountId: operating.id,
      toAccountId: midtransVa.id,
      amount: 10_000_000,
      reference: "TRF-2026-002",
      description: "Top up Midtrans VA",
    },
    {
      date: new Date("2026-02-15"),
      fromAccountId: operating.id,
      toAccountId: xenditVa.id,
      amount: 7_500_000,
      reference: "TRF-2026-003",
      description: "Top up Xendit VA",
    },
  ];

  for (const row of rows) {
    const existing = await prisma.bankTransfer.findFirst({
      where: {
        reference: row.reference,
      },
    });

    if (existing) {
      console.log(`BankTransfer exists: ${row.reference}`);
      continue;
    }

    await prisma.bankTransfer.create({
      data: {
        branchId,
        ...row,
      },
    });
    console.log(`BankTransfer created: ${row.reference}`);
  }
  console.log("Bank Transfers seeding completed.");
}
