export async function seedTransfers(prisma: any) {
  console.log("Seeding warehouse transfers...");

  const branch = await prisma.branch.findFirst({ orderBy: { createdAt: "asc" } });
  const branchId = branch?.id ?? null;

  // Get warehouses
  const warehouses = await prisma.warehouse.findMany({
    where: branchId ? { branchId } : {},
    orderBy: { name: "asc" },
    take: 3,
  });

  if (warehouses.length < 2) {
    console.log("Skipping transfer seed: need at least 2 warehouses.");
    return;
  }

  // Get products
  const products = await prisma.product.findMany({
    where: branchId ? { branchId } : {},
    orderBy: { name: "asc" },
    take: 5,
  });

  if (products.length === 0) {
    console.log("Skipping transfer seed: no products found.");
    return;
  }

  const wh1 = warehouses[0];
  const wh2 = warehouses[1];
  const wh3 = warehouses[2] ?? warehouses[0];
  const prod1 = products[0];
  const prod2 = products[1] ?? products[0];
  const prod3 = products[2] ?? products[0];

  const transfers = [
    {
      transferId: "TRF-2026-0001",
      fromWarehouseId: wh1.id,
      toWarehouseId: wh2.id,
      productId: prod1.id,
      quantity: 10,
      note: "Monthly stock rebalancing",
      branchId,
      transferDate: new Date("2026-02-05"),
    },
    {
      transferId: "TRF-2026-0002",
      fromWarehouseId: wh2.id,
      toWarehouseId: wh3.id,
      productId: prod2.id,
      quantity: 5,
      note: "Branch request",
      branchId,
      transferDate: new Date("2026-02-10"),
    },
    {
      transferId: "TRF-2026-0003",
      fromWarehouseId: wh1.id,
      toWarehouseId: wh3.id,
      productId: prod3.id,
      quantity: 20,
      note: null,
      branchId,
      transferDate: new Date("2026-02-15"),
    },
    {
      transferId: "TRF-2026-0004",
      fromWarehouseId: wh3.id,
      toWarehouseId: wh1.id,
      productId: prod1.id,
      quantity: 3,
      note: "Return to main warehouse",
      branchId,
      transferDate: new Date("2026-02-20"),
    },
  ];

  let seeded = 0;
  for (const transfer of transfers) {
    const existing = await prisma.warehouseTransfer.findUnique({
      where: { transferId: transfer.transferId },
    });
    if (!existing) {
      await prisma.warehouseTransfer.create({ data: transfer });
      seeded++;
    }
  }

  console.log(`Seeded ${seeded} warehouse transfers.`);
}
