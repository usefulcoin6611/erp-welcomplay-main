import { PrismaClient } from "@prisma/client";

export async function seedBills(prisma: PrismaClient) {
  const db = prisma as any;
  console.log("Seeding bills...");

  const branch = await db.branch.findFirst({
    orderBy: { createdAt: "asc" },
  });
  const branchId = branch?.id ?? null;

  const vendor1 = await db.vendor.findUnique({
    where: { vendorCode: "VDR-001" },
  });
  const vendor2 = await db.vendor.findUnique({
    where: { vendorCode: "VDR-002" },
  });

  if (!branchId || !vendor1 || !vendor2) {
    console.log("Skipping bill seed: branch or vendors not found.");
    return;
  }

  const bills = [
    {
      billId: "BILL-2026-001",
      vendorId: vendor1.id,
      branchId,
      category: "Office Supplies",
      billDate: new Date("2026-02-10"),
      dueDate: new Date("2026-02-28"),
      status: "draft",
      total: 16095000,
      reference: "PO-2026-001",
      description: "Office supplies purchase",
      items: [
        {
          itemName: "Printer Paper A4",
          quantity: 50,
          price: 65000,
          discount: 0,
          taxRate: 11,
          amount: 50 * 65000 * 1.11,
          description: "Paper for office printer",
        },
      ],
    },
    {
      billId: "BILL-2026-002",
      vendorId: vendor2.id,
      branchId,
      category: "Logistics",
      billDate: new Date("2026-02-12"),
      dueDate: new Date("2026-03-12"),
      status: "sent",
      total: 9800000,
      reference: "PO-2026-002",
      description: "Logistics services",
      items: [
        {
          itemName: "Courier Service",
          quantity: 1,
          price: 9800000,
          discount: 0,
          taxRate: 11,
          amount: 9800000,
          description: "Monthly logistics service",
        },
      ],
    },
  ];

  for (const b of bills) {
    const existing = await db.bill.findUnique({
      where: { billId: b.billId },
    });

    if (existing) {
      continue;
    }

    await db.bill.create({
      data: {
        billId: b.billId,
        vendorId: b.vendorId,
        branchId: b.branchId,
        category: b.category,
        billDate: b.billDate,
        dueDate: b.dueDate,
        status: b.status,
        total: b.total,
        reference: b.reference,
        description: b.description,
        items: {
          create: b.items.map((it) => ({
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
  }

  console.log(`Seeded ${bills.length} bills.`);
}
