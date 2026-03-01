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

  // Get categories - fetch all categories regardless of branchId
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) {
    console.log("Warning: no categories found. Estimates will be seeded without categoryId.");
  }

  const categoryByName: Record<string, string> = {};
  for (const c of categories) {
    categoryByName[c.name] = c.id;
  }

  // Use first available category as fallback
  const firstCategoryId = categories[0]?.id ?? null;
  const productSalesCatId = categoryByName["Product Sales"] ?? firstCategoryId;
  const maintenanceCatId = categoryByName["Maintenance Sales"] ?? firstCategoryId;

  // Use product names that exist in products seed so quotation edit can match (Product Sales / Maintenance Sales)
  const estimates = [
    // Status 0 = Draft
    {
      estimateId: "QUO-2026-001",
      customerId: cust1.id,
      categoryId: productSalesCatId,
      issueDate: new Date("2026-02-01"),
      status: 0,
      total: 15750000,
      description: "Quotation for office electronics package",
      items: [
        { itemName: "Laptop Dell XPS 13", quantity: 2, price: 5000000, discount: 0, taxRate: 11, amount: 11100000 },
        { itemName: "Keyboard Mechanical", quantity: 5, price: 250000, discount: 25000, taxRate: 11, amount: 1246250 },
        { itemName: "Monitor Samsung 24\"", quantity: 3, price: 350000, discount: 0, taxRate: 11, amount: 1165500 },
      ],
    },
    // Status 1 = Sent
    {
      estimateId: "QUO-2026-002",
      customerId: cust2.id,
      categoryId: maintenanceCatId,
      issueDate: new Date("2026-02-05"),
      status: 1,
      total: 8500000,
      description: "Annual maintenance service quotation",
      items: [
        { itemName: "Development Service", quantity: 1, price: 5000000, discount: 0, taxRate: 11, amount: 5550000 },
        { itemName: "Monthly Maintenance", quantity: 1, price: 2000000, discount: 200000, taxRate: 11, amount: 1998000 },
        { itemName: "Onsite Training", quantity: 2, price: 500000, discount: 0, taxRate: 11, amount: 1110000 },
      ],
    },
    // Status 2 = Accepted
    {
      estimateId: "QUO-2026-003",
      customerId: cust3.id,
      categoryId: productSalesCatId,
      issueDate: new Date("2026-02-10"),
      status: 2,
      total: 22500000,
      description: "Office equipment package - accepted",
      items: [
        { itemName: "Printer HP LaserJet", quantity: 3, price: 4500000, discount: 0, taxRate: 11, amount: 14985000 },
        { itemName: "Router", quantity: 3, price: 750000, discount: 0, taxRate: 11, amount: 2497500 },
        { itemName: "Monitor Samsung 24\"", quantity: 3, price: 1200000, discount: 0, taxRate: 11, amount: 3996000 },
        { itemName: "Office Chair Ergonomic", quantity: 3, price: 350000, discount: 0, taxRate: 11, amount: 1165500 },
      ],
    },
    // Status 3 = Declined
    {
      estimateId: "QUO-2026-004",
      customerId: cust4.id,
      categoryId: maintenanceCatId,
      issueDate: new Date("2026-02-12"),
      status: 3,
      total: 45000000,
      description: "Enterprise software license - declined by customer",
      items: [
        { itemName: "Lisensi ERP Cloud", quantity: 1, price: 30000000, discount: 0, taxRate: 11, amount: 33300000 },
        { itemName: "Development Service", quantity: 1, price: 10000000, discount: 0, taxRate: 11, amount: 11100000 },
      ],
    },
    // Status 0 = Draft (recent)
    {
      estimateId: "QUO-2026-005",
      customerId: cust1.id,
      categoryId: productSalesCatId,
      issueDate: new Date("2026-02-20"),
      status: 0,
      total: 5500000,
      description: "Accessories bundle quotation",
      items: [
        { itemName: "Keyboard Mechanical", quantity: 5, price: 850000, discount: 0, taxRate: 11, amount: 4717500 },
        { itemName: "Desk Lamp LED", quantity: 5, price: 150000, discount: 0, taxRate: 11, amount: 832500 },
      ],
    },
    // Status 1 = Sent (recent)
    {
      estimateId: "QUO-2026-006",
      customerId: cust2.id,
      categoryId: maintenanceCatId,
      issueDate: new Date("2026-02-22"),
      status: 1,
      total: 12210000,
      description: "Networking equipment quotation",
      items: [
        { itemName: "Router", quantity: 2, price: 3500000, discount: 0, taxRate: 11, amount: 7770000 },
        { itemName: "Ethernet Cable (Box)", quantity: 4, price: 1000000, discount: 0, taxRate: 11, amount: 4440000 },
      ],
    },
  ];

  let seeded = 0;
  let updated = 0;
  for (const est of estimates) {
    const { items, ...estimateData } = est as any;
    const existing = await prisma.estimate.findUnique({
      where: { estimateId: est.estimateId },
    });
    if (!existing) {
      // Create new estimate with items
      await prisma.estimate.create({
        data: {
          ...estimateData,
          items: {
            create: items.map((it: any) => ({
              itemName: it.itemName,
              quantity: it.quantity,
              price: it.price,
              discount: it.discount,
              taxRate: it.taxRate,
              amount: it.amount,
            })),
          },
        },
      });
      seeded++;
    } else {
      // Update existing estimate to set correct categoryId (fix for estimates seeded before categories)
      await prisma.estimate.update({
        where: { estimateId: est.estimateId },
        data: {
          categoryId: estimateData.categoryId,
          customerId: estimateData.customerId,
          issueDate: estimateData.issueDate,
          status: estimateData.status,
          total: estimateData.total,
          description: estimateData.description,
        },
      });
      updated++;
    }
  }

  console.log(`Seeded ${seeded} new estimates, updated ${updated} existing estimates (quotations).`);
}
