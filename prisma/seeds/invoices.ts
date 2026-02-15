import { PrismaClient } from "@prisma/client";

export async function seedInvoices(prisma: PrismaClient) {
  console.log("Seeding Invoices...");

  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "asc" } });
  if (customers.length === 0) {
    console.log("No customers found; skipping invoice seeding.");
    return;
  }
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "asc" } });
  const categoryByName: Record<string, string> = {};
  for (const c of categories) {
    categoryByName[c.name] = c.id;
  }

  const cust1 = customers[0].id;
  const cust2 = customers[1]?.id || customers[0].id;
  const cust3 = customers[2]?.id || customers[0].id;

  const baseData = [
    {
      invoiceId: "INV-2026-001",
      customerId: cust1,
      categoryId: categoryByName["Service Income"] || null,
      issueDate: new Date("2026-01-10"),
      dueDate: new Date("2026-01-25"),
      status: 0,
      dueAmount: 13320000,
      description: "Website development - phase 1",
      items: [
        { itemName: "Development Service", quantity: 1, price: 12000000, discount: 0, taxRate: 11, amount: 13320000, description: "Full-stack service" },
      ],
    },
    {
      invoiceId: "INV-2026-002",
      customerId: cust1,
      categoryId: categoryByName["Maintenance Sales"] || null,
      issueDate: new Date("2026-01-12"),
      dueDate: new Date("2026-01-26"),
      status: 1,
      dueAmount: 9990000,
      description: "Maintenance subscription",
      items: [
        { itemName: "Monthly Maintenance", quantity: 1, price: 9000000, discount: 0, taxRate: 11, amount: 9990000, description: "" },
      ],
    },
    {
      invoiceId: "INV-2026-003",
      customerId: cust2,
      categoryId: categoryByName["Product Sales"] || null,
      issueDate: new Date("2026-01-15"),
      dueDate: new Date("2026-01-30"),
      status: 2,
      dueAmount: 5633000,
      description: "Hardware supplies",
      items: [
        { itemName: "Router", quantity: 2, price: 2200000, discount: 200000, taxRate: 11, amount: 4829000, description: "" },
        { itemName: "Ethernet Cable (Box)", quantity: 1, price: 750000, discount: 0, taxRate: 11, amount: 832500, description: "" },
        { itemName: "Wall Mount", quantity: 1, price: 450000, discount: 0, taxRate: 11, amount: 499500, description: "" },
      ],
    },
    {
      invoiceId: "INV-2026-004",
      customerId: cust2,
      categoryId: categoryByName["Service Income"] || null,
      issueDate: new Date("2026-01-18"),
      dueDate: new Date("2026-02-02"),
      status: 3,
      dueAmount: 5500000,
      description: "Mobile app development - milestone 1",
      items: [
        { itemName: "Design Sprint", quantity: 1, price: 6000000, discount: 0, taxRate: 11, amount: 6660000, description: "" },
        { itemName: "Backend Setup", quantity: 1, price: 5000000, discount: 0, taxRate: 11, amount: 5550000, description: "" },
      ],
    },
    {
      invoiceId: "INV-2026-005",
      customerId: cust3,
      categoryId: categoryByName["Other Income"] || null,
      issueDate: new Date("2026-01-21"),
      dueDate: new Date("2026-02-05"),
      status: 4,
      dueAmount: 0,
      description: "Training and onboarding package",
      items: [
        { itemName: "Onsite Training", quantity: 2, price: 3500000, discount: 0, taxRate: 11, amount: 7770000, description: "" },
        { itemName: "Documentation", quantity: 1, price: 1500000, discount: 0, taxRate: 11, amount: 1665000, description: "" },
      ],
    },
  ];

  for (const inv of baseData) {
    const existing = await prisma.invoice.findUnique({ where: { invoiceId: inv.invoiceId } });
    if (existing) {
      console.log(`Invoice exists: ${inv.invoiceId}`);
      continue;
    }
    await prisma.invoice.create({
      data: {
        invoiceId: inv.invoiceId,
        customerId: inv.customerId,
        categoryId: inv.categoryId ?? null,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        status: inv.status,
        dueAmount: inv.dueAmount,
        description: inv.description,
        items: {
          create: inv.items.map((it) => ({
            itemName: it.itemName,
            quantity: it.quantity,
            price: it.price,
            discount: it.discount,
            taxRate: it.taxRate,
            amount: it.amount,
            description: it.description,
          })),
        },
      },
    });
    console.log(`Invoice seeded: ${inv.invoiceId}`);
  }

  console.log("Invoices seeding completed.");
}
