export async function seedEstimates(prisma: any) {
  console.log("Seeding estimates (POS quotations)...");

  // Get customers
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "asc" },
    take: 5,
  });

  if (customers.length === 0) {
    console.log("Skipping estimate seed: no customers found.");
    return;
  }

  const cust1 = customers[0];
  const cust2 = customers[1] ?? customers[0];
  const cust3 = customers[2] ?? customers[0];
  const cust4 = customers[3] ?? customers[0];

  // Get categories
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
  });
  const categoryByName: Record<string, string> = {};
  for (const c of categories) {
    categoryByName[c.name] = c.id;
  }
  const firstCategoryId = categories[0]?.id ?? null;

  const estimates = [
    // Status 0 = Draft
    {
      estimateId: "QUO-2026-001",
      customerId: cust1.id,
      categoryId: categoryByName["Product Sales"] ?? firstCategoryId,
      issueDate: new Date("2026-02-01"),
      status: 0,
      total: 15750000,
      description: "Quotation for office electronics package",
      items: {
        create: [
          { itemName: "Laptop Dell XPS 15", quantity: 2, price: 5000000, discount: 0, taxRate: 11, amount: 11100000 },
          { itemName: "Wireless Mouse", quantity: 5, price: 250000, discount: 25000, taxRate: 11, amount: 1246250 },
          { itemName: "USB-C Hub", quantity: 3, price: 350000, discount: 0, taxRate: 11, amount: 1165500 },
        ],
      },
    },
    // Status 1 = Sent
    {
      estimateId: "QUO-2026-002",
      customerId: cust2.id,
      categoryId: categoryByName["Maintenance Sales"] ?? firstCategoryId,
      issueDate: new Date("2026-02-05"),
      status: 1,
      total: 8500000,
      description: "Annual maintenance service quotation",
      items: {
        create: [
          { itemName: "Server Maintenance (Annual)", quantity: 1, price: 5000000, discount: 0, taxRate: 11, amount: 5550000 },
          { itemName: "Network Setup", quantity: 1, price: 2000000, discount: 200000, taxRate: 11, amount: 1998000 },
          { itemName: "On-site Support (8 hrs)", quantity: 2, price: 500000, discount: 0, taxRate: 11, amount: 1110000 },
        ],
      },
    },
    // Status 2 = Accepted
    {
      estimateId: "QUO-2026-003",
      customerId: cust3.id,
      categoryId: categoryByName["Product Sales"] ?? firstCategoryId,
      issueDate: new Date("2026-02-10"),
      status: 2,
      total: 22500000,
      description: "POS system hardware package - accepted",
      items: {
        create: [
          { itemName: "POS Terminal", quantity: 3, price: 4500000, discount: 0, taxRate: 11, amount: 14985000 },
          { itemName: "Barcode Scanner", quantity: 3, price: 750000, discount: 0, taxRate: 11, amount: 2497500 },
          { itemName: "Receipt Printer", quantity: 3, price: 1200000, discount: 0, taxRate: 11, amount: 3996000 },
          { itemName: "Cash Drawer", quantity: 3, price: 350000, discount: 0, taxRate: 11, amount: 1165500 },
        ],
      },
    },
    // Status 3 = Declined
    {
      estimateId: "QUO-2026-004",
      customerId: cust4.id,
      categoryId: firstCategoryId,
      issueDate: new Date("2026-02-12"),
      status: 3,
      total: 45000000,
      description: "Enterprise software license - declined by customer",
      items: {
        create: [
          { itemName: "ERP License (Annual)", quantity: 1, price: 30000000, discount: 0, taxRate: 11, amount: 33300000 },
          { itemName: "Implementation Service", quantity: 1, price: 10000000, discount: 0, taxRate: 11, amount: 11100000 },
        ],
      },
    },
    // Status 0 = Draft (recent)
    {
      estimateId: "QUO-2026-005",
      customerId: cust1.id,
      categoryId: categoryByName["Product Sales"] ?? firstCategoryId,
      issueDate: new Date("2026-02-20"),
      status: 0,
      total: 5500000,
      description: "Accessories bundle quotation",
      items: {
        create: [
          { itemName: "Mechanical Keyboard", quantity: 5, price: 850000, discount: 0, taxRate: 11, amount: 4717500 },
          { itemName: "Monitor Stand", quantity: 5, price: 150000, discount: 0, taxRate: 11, amount: 832500 },
        ],
      },
    },
    // Status 1 = Sent (recent)
    {
      estimateId: "QUO-2026-006",
      customerId: cust2.id,
      categoryId: firstCategoryId,
      issueDate: new Date("2026-02-22"),
      status: 1,
      total: 12000000,
      description: "Networking equipment quotation",
      items: {
        create: [
          { itemName: "Managed Switch 24-port", quantity: 2, price: 3500000, discount: 0, taxRate: 11, amount: 7770000 },
          { itemName: "Wireless Access Point", quantity: 4, price: 1000000, discount: 0, taxRate: 11, amount: 4440000 },
        ],
      },
    },
  ];

  let seeded = 0;
  for (const est of estimates) {
    const { items, ...estimateData } = est as any;
    const existing = await prisma.estimate.findUnique({
      where: { estimateId: est.estimateId },
    });
    if (!existing) {
      await prisma.estimate.create({ data: est });
      seeded++;
    } else {
      console.log(`Estimate ${est.estimateId} already exists, skipping.`);
    }
  }

  console.log(`Seeded ${seeded} estimates (quotations).`);
}
