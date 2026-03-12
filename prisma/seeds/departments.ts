export async function seedDepartments(prisma: any) {
  console.log("Seeding Departments...");

  const branches = await prisma.branch.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (branches.length === 0) {
    console.log("No branches found; skipping Departments seeding.");
    return;
  }

  type SeedDepartment = {
    name: string;
    branchName: string;
  };

  const departments: SeedDepartment[] = [
    { name: "IT Department", branchName: "Pusat Jakarta" },
    { name: "HR Department", branchName: "Pusat Jakarta" },
    { name: "Sales Department", branchName: "Pusat Jakarta" },
    { name: "Finance Department", branchName: "Pusat Jakarta" },
    { name: "Marketing Department", branchName: "Pusat Jakarta" },
    { name: "Operations Department", branchName: "Cabang Bandung" },
    { name: "Support Department", branchName: "Cabang Surabaya" },
  ];

  const branchByName: Record<string, string> = {};
  for (const b of branches) {
    branchByName[b.name] = b.id;
  }

  let createdCount = 0;

  for (const d of departments) {
    const branchId = branchByName[d.branchName] ?? branches[0].id;

    const existing = await prisma.department.findFirst({
      where: {
        name: d.name,
        branchId,
      },
    });

    if (existing) {
      continue;
    }

    await prisma.department.create({
      data: {
        name: d.name,
        branchId,
      },
    });

    createdCount++;
    console.log(`Department created: ${d.name} (${d.branchName})`);
  }

  console.log(`Departments seeding completed. New records: ${createdCount}`);
}

