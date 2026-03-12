export async function seedPayments(prisma: any) {
  const db = prisma as any;
  console.log("Seeding payments...");

  const branch = await db.branch.findFirst({
    orderBy: { createdAt: "asc" },
  });
  const branchId = branch?.id ?? null;

  const categories = await db.category.findMany({
    where: {
      branchId,
      type: "Expense",
    },
  });

  const getCategoryName = (name: string) => {
    // If exact name found, use it
    const exact = categories.find((c: any) => c.name === name);
    if (exact) return exact.name;
    // Otherwise fallback to first available or "General"
    return categories[0]?.name ?? "General";
  };

  const vendors = await db.vendor.findMany({
    where: { branchId },
  });

  const getVendorName = (code: string) => {
    const vendor = vendors.find((v: any) => v.vendorCode === code);
    return vendor?.name ?? vendors[0]?.name ?? "Unknown Vendor";
  };

  const bankAccounts = await db.bankAccount.findMany({
    where: { branchId },
  });

  const getAccountName = (bankName: string) => {
    const acc = bankAccounts.find((b: any) => b.bank.includes(bankName));
    return acc ? `${acc.bank} - ${acc.holderName}` : bankAccounts[0] ? `${bankAccounts[0].bank} - ${bankAccounts[0].holderName}` : "Cash";
  };

  if (!branchId) {
    console.log("Skipping payment seed: branch not found.");
    return;
  }

  const payments = [
    {
      paymentId: "PAY-2026-001",
      date: new Date("2026-02-15"),
      amount: 5000000,
      account: getAccountName("BCA"),
      vendor: getVendorName("VDR-001"),
      category: getCategoryName("Office Supplies"),
      reference: "INV-2026-001",
      description: "Payment for office supplies invoice",
      status: "Completed",
    },
    {
      paymentId: "PAY-2026-002",
      date: new Date("2026-02-18"),
      amount: 7500000,
      account: getAccountName("Mandiri"),
      vendor: getVendorName("VDR-002"),
      category: getCategoryName("Logistics"),
      reference: "INV-2026-002",
      description: "Payment for logistics services",
      status: "Completed",
    },
    {
      paymentId: "PAY-2026-003",
      date: new Date("2026-02-20"),
      amount: 2500000,
      account: getAccountName("BCA"),
      vendor: getVendorName("VDR-001"),
      category: getCategoryName("Utility"),
      reference: "UB-FEB-2026",
      description: "Utility bill payment",
      status: "Completed",
    },
    {
      paymentId: "PAY-2026-004",
      date: new Date("2026-02-22"),
      amount: 12000000,
      account: getAccountName("Mandiri"),
      vendor: getVendorName("VDR-002"),
      category: getCategoryName("Rent"), // Might fallback if Rent category doesn't exist
      reference: "RENT-Q1",
      description: "Quarterly office rent payment",
      status: "Completed",
    },
    {
      paymentId: "PAY-2026-005",
      date: new Date("2026-02-25"),
      amount: 1500000,
      account: getAccountName("BCA"),
      vendor: getVendorName("VDR-001"),
      category: getCategoryName("Maintenance"),
      reference: "MAINT-001",
      description: "AC Maintenance service",
      status: "Completed",
    }
  ];

  for (const p of payments) {
    await db.payment.upsert({
      where: { paymentId: p.paymentId },
      update: {},
      create: {
        paymentId: p.paymentId,
        branchId,
        date: p.date,
        amount: p.amount,
        account: p.account,
        vendor: p.vendor,
        category: p.category,
        reference: p.reference,
        description: p.description,
        status: p.status,
      },
    });
  }

  console.log(`Seeded ${payments.length} payments.`);
}
