export async function seedHrmAssets(prisma: any) {
  console.log("Seeding HRM assets...");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS hrm_assets (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      purchase_date DATE NULL,
      supported_date DATE NULL,
      amount NUMERIC(18,2) NOT NULL DEFAULT 0,
      description TEXT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS hrm_asset_employees (
      id SERIAL PRIMARY KEY,
      asset_id INTEGER NOT NULL REFERENCES hrm_assets(id) ON DELETE CASCADE,
      employee_id TEXT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (asset_id, employee_id)
    );
  `);

  // Selalu reset data asset HRM agar sinkron dengan data employee terbaru (environment dev/demo)
  await prisma.$executeRawUnsafe(`DELETE FROM hrm_asset_employees;`);
  await prisma.$executeRawUnsafe(`DELETE FROM hrm_assets;`);

  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, branch: true, department: true },
  });

  if (!employees.length) {
    console.warn("No employees found, skipping HRM assets seeding.");
    return;
  }

  type SeedAsset = {
    name: string;
    purchaseDate: string;
    supportedDate: string;
    amount: number;
    description: string;
    employeeIds: string[];
  };

  const seedAssets: SeedAsset[] = [];

  // Satu laptop & satu paket seragam per employee aktif agar benar-benar related
  for (const emp of employees) {
    seedAssets.push({
      name: `Laptop Kantor - ${emp.name}`,
      purchaseDate: "2024-01-10",
      supportedDate: "2027-01-10",
      amount: 12000000,
      description:
        `Laptop kerja untuk ${emp.name} di ${emp.department ?? "departemen terkait"}, terhubung ke sistem ERP.`,
      employeeIds: [emp.id],
    });

    seedAssets.push({
      name: `Seragam Kantor - ${emp.name}`,
      purchaseDate: "2024-01-15",
      supportedDate: "2025-12-31",
      amount: 750000,
      description:
        `Paket seragam resmi perusahaan untuk ${emp.name} sesuai kebijakan HR.`,
      employeeIds: [emp.id],
    });
  }

  for (const asset of seedAssets) {
    const inserted = await prisma.$queryRaw<{ id: number }[]>`
      INSERT INTO hrm_assets (name, purchase_date, supported_date, amount, description)
      VALUES (
        ${asset.name},
        ${new Date(`${asset.purchaseDate}T00:00:00.000Z`)},
        ${new Date(`${asset.supportedDate}T00:00:00.000Z`)},
        ${asset.amount},
        ${asset.description}
      )
      RETURNING id
    `;

    const assetId = inserted[0]?.id;
    if (!assetId) continue;

    for (const empId of asset.employeeIds) {
      await prisma.$queryRaw`
        INSERT INTO hrm_asset_employees (asset_id, employee_id)
        VALUES (${assetId}, ${empId})
        ON CONFLICT (asset_id, employee_id) DO NOTHING
      `;
    }
  }

  console.log("HRM assets seeding completed.");
}

