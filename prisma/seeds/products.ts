export async function seedProducts(prisma: any) {
  console.log("Seeding Products (for Product Stock)...");

  const branch = await prisma.branch.findFirst({
    orderBy: { createdAt: "asc" },
  });
  const branchId = branch?.id ?? null;

  const categories = await prisma.category.findMany({
    where: { type: "Product & Service" },
    orderBy: { createdAt: "asc" },
  });
  const categoryByName: Record<string, string> = {};
  for (const c of categories) {
    categoryByName[c.name] = c.id;
  }

  const units = await prisma.unit.findMany({ orderBy: { createdAt: "asc" } });
  const unitByName: Record<string, string> = {};
  for (const u of units) {
    unitByName[u.name] = u.id;
  }

  const taxes = await prisma.tax.findMany({ orderBy: { createdAt: "asc" } });
  const taxByName: Record<string, string> = {};
  for (const t of taxes) {
    taxByName[t.name] = t.id;
  }

  await prisma.product.deleteMany({
    where: {
      sku: { in: ["EXP-SRV-TAXI", "EXP-SRV-MEAL", "EXP-SRV-UTILITY", "EXP-SRV-RENT", "EXP-OFF-STATION"] },
    },
  });

  const products = [
    {
      name: "Lisensi ERP Cloud",
      sku: "ERP-CLD-001",
      salePrice: 25000000,
      purchasePrice: 15000000,
      categoryName: "Product Sales",
      unitName: "Piece",
      taxName: "PPN 11%",
      quantity: 120,
      type: "product",
    },
    {
      name: "Office Chair Ergonomic",
      sku: "FUR-CHAIR-002",
      salePrice: 2500000,
      purchasePrice: 1500000,
      categoryName: "Product Sales",
      unitName: "Piece",
      taxName: "PPN 11%",
      quantity: 8,
      type: "product",
    },
    {
      name: "Printer HP LaserJet",
      sku: "PRT-HP-003",
      salePrice: 3500000,
      purchasePrice: 2500000,
      categoryName: "Product Sales",
      unitName: "Piece",
      taxName: "PPN 11%",
      quantity: 0,
      type: "product",
    },
    {
      name: "Laptop Dell XPS 13",
      sku: "LAP-DELL-004",
      salePrice: 18000000,
      purchasePrice: 12000000,
      categoryName: "Product Sales",
      unitName: "Piece",
      taxName: "PPN 11%",
      quantity: 45,
      type: "product",
    },
    {
      name: "USB Flash Drive 32GB",
      sku: "ACC-USB-005",
      salePrice: 150000,
      purchasePrice: 80000,
      categoryName: "Product Sales",
      unitName: "Piece",
      taxName: "PPN 11%",
      quantity: 7,
      type: "product",
    },
    {
      name: "Monitor Samsung 24\"",
      sku: "MON-SAM-006",
      salePrice: 2200000,
      purchasePrice: 1500000,
      categoryName: "Product Sales",
      unitName: "Piece",
      taxName: "PPN 11%",
      quantity: 32,
      type: "product",
    },
    {
      name: "Keyboard Mechanical",
      sku: "ACC-KEY-007",
      salePrice: 900000,
      purchasePrice: 500000,
      categoryName: "Product Sales",
      unitName: "Piece",
      taxName: "PPN 11%",
      quantity: 0,
      type: "product",
    },
    {
      name: "Desk Lamp LED",
      sku: "FUR-LAMP-008",
      salePrice: 350000,
      purchasePrice: 200000,
      categoryName: "Product Sales",
      unitName: "Piece",
      taxName: "PPN 11%",
      quantity: 25,
      type: "product",
    },
    {
      name: "Paper A4 80gsm",
      sku: "OFF-PAP-009",
      salePrice: 60000,
      purchasePrice: 35000,
      categoryName: "Product Sales",
      unitName: "Pack",
      taxName: "PPN 11%",
      quantity: 5,
      type: "product",
    },
    {
      name: "Whiteboard Marker",
      sku: "OFF-MAR-010",
      salePrice: 20000,
      purchasePrice: 10000,
      categoryName: "Product Sales",
      unitName: "Piece",
      taxName: "PPN 11%",
      quantity: 18,
      type: "product",
    },
  ];

  for (const p of products) {
    const categoryId = p.categoryName ? categoryByName[p.categoryName] ?? null : null;
    const unitId = p.unitName ? unitByName[p.unitName] ?? null : null;
    const taxId = p.taxName ? taxByName[p.taxName] ?? null : null;

    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        salePrice: p.salePrice,
        purchasePrice: p.purchasePrice,
        quantity: p.quantity,
        type: p.type,
        categoryId,
        unitId,
        taxId,
        branchId,
      },
      create: {
        name: p.name,
        sku: p.sku,
        salePrice: p.salePrice,
        purchasePrice: p.purchasePrice,
        quantity: p.quantity,
        type: p.type,
        categoryId,
        unitId,
        taxId,
        branchId,
      },
    });

    console.log(`Product seeded: ${p.sku} - ${p.name}`);
  }

  console.log("Products seeding completed.");
}
