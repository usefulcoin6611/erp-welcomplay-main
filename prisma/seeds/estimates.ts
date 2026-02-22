export async function seedEstimates(prisma: any) {
  console.log("Seeding estimates...");

  const cust1 = await prisma.customer.findUnique({ where: { customerCode: "CUST-001" } });
  const cust2 = await prisma.customer.findUnique({ where: { customerCode: "CUST-003" } });

  const categories = await prisma.category.findMany({
    where: { type: "Product & Service" },
    orderBy: { createdAt: "asc" },
  });
  const categoryByName: Record<string, string> = {};
  for (const c of categories) {
    categoryByName[c.name] = c.id;
  }

  if (categories.length === 0) {
    console.log(
      "Warning: no Product & Service categories found; estimates will be seeded without categoryId.",
    );
  }

  if (!cust1 || !cust2) {
    console.log("Skipping estimate seed: required customers not found.");
    return;
  }

  const estimates = [
    {
      estimateId: "PR-2026-001",
      customerId: cust1.id,
      categoryId: categoryByName["Maintenance Sales"] || null,
      issueDate: new Date("2026-02-10"),
      status: 0,
      total: 12500000,
      description: "Website development proposal",
      items: {
        create: [
          { itemName: "Design Sprint", quantity: 10, price: 500000, discount: 0, taxRate: 11, amount: 5550000 },
          { itemName: "Development Service", quantity: 15, price: 500000, discount: 0, taxRate: 11, amount: 8325000 },
        ],
      },
    },
    {
      estimateId: "PR-2026-002",
      customerId: cust2.id,
      categoryId: categoryByName["Product Sales"] || null,
      issueDate: new Date("2026-02-12"),
      status: 2,
      total: 9800000,
      description: "Retail POS setup",
      items: {
        create: [
          { itemName: "Router", quantity: 4, price: 2000000, discount: 200000, taxRate: 11, amount: 7920000 },
          { itemName: "Onsite Training", quantity: 1, price: 1500000, discount: 0, taxRate: 11, amount: 1665000 },
        ],
      },
    },
  ];

  for (const est of estimates) {
    const { items, ...estimateData } = est as any;
    await prisma.estimate.upsert({
      where: { estimateId: est.estimateId },
      update: estimateData,
      create: est,
    });
  }

  console.log(`Seeded ${estimates.length} estimates.`);
}
