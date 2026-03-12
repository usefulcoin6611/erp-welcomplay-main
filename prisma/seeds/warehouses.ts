export async function seedWarehouses(prisma: any) {
  const branch = await prisma.branch.findFirst()
  if (!branch) {
    console.log("No branch found, skipping warehouse seed")
    return
  }

  const warehouses = [
    {
      name: "Main Warehouse",
      address: "Jl. Industri No. 10, Jakarta Barat",
      phone: "021-12345678",
      branchId: branch.id,
      isActive: true,
    },
    {
      name: "Branch Warehouse A",
      address: "Jl. Raya Bekasi Km 5, Bekasi",
      phone: "021-87654321",
      branchId: branch.id,
      isActive: true,
    },
    {
      name: "Distribution Center",
      address: "Kawasan Industri Cikarang, Bekasi",
      phone: "021-11223344",
      branchId: branch.id,
      isActive: true,
    },
  ]

  for (const warehouse of warehouses) {
    const existing = await prisma.warehouse.findFirst({
      where: { name: warehouse.name, branchId: branch.id },
    })
    if (!existing) {
      await prisma.warehouse.create({ data: warehouse })
      console.log(`Created warehouse: ${warehouse.name}`)
    } else {
      console.log(`Warehouse already exists: ${warehouse.name}`)
    }
  }
}
