export async function seedBills(prisma: any) {
  const db = prisma as any;
  console.log("Seeding bills...");

  const branch = await db.branch.findFirst({
    orderBy: { createdAt: "asc" },
  });
  const branchId = branch?.id ?? null;

  const categories = await db.category.findMany({
    where: {
      branchId,
    },
  });

  const getCategoryId = (name: string) =>
    categories.find((c: any) => c.name === name)?.id ?? null;

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

  const products = await db.product.findMany({
    where: {
      branchId,
    },
  });

  const productByName: Record<string, string> = {};
  for (const p of products) {
    if (typeof p.name === "string" && typeof p.id === "string") {
      productByName[p.name] = p.id;
    }
  }

  const bills = [
    // Bill dengan banyak produk dan kombinasi diskon/pajak
    {
      billId: "BILL-2026-001",
      vendorId: vendor1.id,
      branchId,
      categoryId: getCategoryId("Office Supplies"),
      billDate: new Date("2026-02-10"),
      dueDate: new Date("2026-02-28"),
      status: "draft",
      reference: "PO-2026-001",
      description: "Office supplies purchase for new branch",
      items: [
        {
          itemName: "Paper A4 80gsm",
          quantity: 50,
          price: 65000,
          discount: 0,
          taxRate: 11,
          description: "Paper for office printer",
        },
        {
          itemName: "Whiteboard Marker",
          quantity: 10,
          price: 350000,
          discount: 250000,
          taxRate: 11,
          description: "Black ink cartridge for HP printer",
        },
        {
          itemName: "Desk Lamp LED",
          quantity: 5,
          price: 425000,
          discount: 0,
          taxRate: 0,
          description: "Pens, markers, sticky notes, folders",
        },
      ].map((it) => ({
        ...it,
        amount:
          (it.quantity as number) *
            (it.price as number) -
          (it.discount as number) +
          ((it.taxRate as number) / 100) *
            (Math.max(
              0,
              (it.quantity as number) * (it.price as number) -
                (it.discount as number),
            )),
      })),
    },
    // Bill dengan status sent
    {
      billId: "BILL-2026-002",
      vendorId: vendor2.id,
      branchId,
      categoryId: getCategoryId("Logistics"),
      billDate: new Date("2026-02-12"),
      dueDate: new Date("2026-03-12"),
      status: "sent",
      reference: "PO-2026-002",
      description: "Monthly logistics and courier services",
      items: [
        {
          itemName: "Router",
          quantity: 8,
          price: 750000,
          discount: 0,
          taxRate: 11,
          description: "Regular courier service for local shipment",
        },
        {
          itemName: "Ethernet Cable (Box)",
          quantity: 3,
          price: 1250000,
          discount: 250000,
          taxRate: 11,
          description: "Express courier service for urgent shipment",
        },
      ].map((it) => ({
        ...it,
        amount:
          (it.quantity as number) *
            (it.price as number) -
          (it.discount as number) +
          ((it.taxRate as number) / 100) *
            (Math.max(
              0,
              (it.quantity as number) * (it.price as number) -
                (it.discount as number),
            )),
      })),
    },
    // Bill partial (seolah sebagian sudah dibayar / akan ada debit note)
    {
      billId: "BILL-2026-003",
      vendorId: vendor1.id,
      branchId,
      categoryId: getCategoryId("IT Services"),
      billDate: new Date("2026-02-15"),
      dueDate: new Date("2026-03-01"),
      status: "partial",
      reference: "PO-2026-003",
      description: "Monthly IT support and cloud subscription",
      items: [
        {
          itemName: "Development Service",
          quantity: 1,
          price: 12000000,
          discount: 0,
          taxRate: 11,
          description: "ERP Cloud subscription February 2026",
        },
        {
          itemName: "Monthly Maintenance",
          quantity: 10,
          price: 350000,
          discount: 150000,
          taxRate: 11,
          description: "Onsite support visit and troubleshooting",
        },
      ].map((it) => ({
        ...it,
        amount:
          (it.quantity as number) *
            (it.price as number) -
          (it.discount as number) +
          ((it.taxRate as number) / 100) *
            (Math.max(
              0,
              (it.quantity as number) * (it.price as number) -
                (it.discount as number),
            )),
      })),
    },
    // Bill paid (untuk contoh status paid di UI)
    {
      billId: "BILL-2026-004",
      vendorId: vendor2.id,
      branchId,
      categoryId: getCategoryId("Utility"),
      billDate: new Date("2026-01-25"),
      dueDate: new Date("2026-02-05"),
      status: "paid",
      reference: "PO-2026-004",
      description: "Electricity and internet bill January 2026",
      items: [
        {
          itemName: "Lisensi ERP Cloud",
          quantity: 1,
          price: 3500000,
          discount: 0,
          taxRate: 0,
          description: "Electricity usage January 2026",
        },
        {
          itemName: "Onsite Training",
          quantity: 1,
          price: 1500000,
          discount: 0,
          taxRate: 11,
          description: "Business internet subscription January 2026",
        },
      ].map((it) => ({
        ...it,
        amount:
          (it.quantity as number) *
            (it.price as number) -
          (it.discount as number) +
          ((it.taxRate as number) / 100) *
            (Math.max(
              0,
              (it.quantity as number) * (it.price as number) -
                (it.discount as number),
            )),
      })),
    },
  ];

  for (const b of bills) {
    const itemsTotal = b.items.reduce(
      (sum: number, it: any) => sum + Number(it.amount || 0),
      0,
    );

    await db.bill.upsert({
      where: { billId: b.billId },
      update: {
        vendorId: b.vendorId,
        branchId: b.branchId,
        categoryId: b.categoryId,
        billDate: b.billDate,
        dueDate: b.dueDate,
        status: b.status,
        total: itemsTotal,
        reference: b.reference,
        description: b.description,
        items: {
          deleteMany: { billId: b.billId },
          create: b.items.map((it: any) => ({
            productId: productByName[it.itemName] ?? null,
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
      create: {
        billId: b.billId,
        vendorId: b.vendorId,
        branchId: b.branchId,
        categoryId: b.categoryId,
        billDate: b.billDate,
        dueDate: b.dueDate,
        status: b.status,
        total: itemsTotal,
        reference: b.reference,
        description: b.description,
        items: {
          create: b.items.map((it: any) => ({
            productId: productByName[it.itemName] ?? null,
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
