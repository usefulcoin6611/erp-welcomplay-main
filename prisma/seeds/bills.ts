export async function seedBills(prisma: any) {
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
    // Bill dengan banyak produk dan kombinasi diskon/pajak
    {
      billId: "BILL-2026-001",
      vendorId: vendor1.id,
      branchId,
      category: "Office Supplies",
      billDate: new Date("2026-02-10"),
      dueDate: new Date("2026-02-28"),
      status: "draft",
      reference: "PO-2026-001",
      description: "Office supplies purchase for new branch",
      items: [
        {
          itemName: "Printer Paper A4",
          quantity: 50,
          price: 65000,
          discount: 0,
          taxRate: 11,
          description: "Paper for office printer",
        },
        {
          itemName: "Ink Cartridge Black",
          quantity: 10,
          price: 350000,
          discount: 250000,
          taxRate: 11,
          description: "Black ink cartridge for HP printer",
        },
        {
          itemName: "Office Stationery Set",
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
      category: "Logistics",
      billDate: new Date("2026-02-12"),
      dueDate: new Date("2026-03-12"),
      status: "sent",
      reference: "PO-2026-002",
      description: "Monthly logistics and courier services",
      items: [
        {
          itemName: "Courier Service - Regular",
          quantity: 8,
          price: 750000,
          discount: 0,
          taxRate: 11,
          description: "Regular courier service for local shipment",
        },
        {
          itemName: "Courier Service - Express",
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
      category: "IT Services",
      billDate: new Date("2026-02-15"),
      dueDate: new Date("2026-03-01"),
      status: "partial",
      reference: "PO-2026-003",
      description: "Monthly IT support and cloud subscription",
      items: [
        {
          itemName: "Cloud ERP Subscription",
          quantity: 1,
          price: 12000000,
          discount: 0,
          taxRate: 11,
          description: "ERP Cloud subscription February 2026",
        },
        {
          itemName: "Onsite Support Hours",
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
      category: "Utility",
      billDate: new Date("2026-01-25"),
      dueDate: new Date("2026-02-05"),
      status: "paid",
      reference: "PO-2026-004",
      description: "Electricity and internet bill January 2026",
      items: [
        {
          itemName: "Electricity Charge",
          quantity: 1,
          price: 3500000,
          discount: 0,
          taxRate: 0,
          description: "Electricity usage January 2026",
        },
        {
          itemName: "Internet Service",
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
    const existing = await db.bill.findUnique({
      where: { billId: b.billId },
    });

    if (existing) {
      continue;
    }

    const itemsTotal = b.items.reduce(
      (sum: number, it: any) => sum + Number(it.amount || 0),
      0,
    );

    await db.bill.create({
      data: {
        billId: b.billId,
        vendorId: b.vendorId,
        branchId: b.branchId,
        category: b.category,
        billDate: b.billDate,
        dueDate: b.dueDate,
        status: b.status,
        total: itemsTotal,
        reference: b.reference,
        description: b.description,
        items: {
          create: b.items.map((it: any) => ({
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
