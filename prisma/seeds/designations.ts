export async function seedDesignations(prisma: any) {
  console.log("Seeding Designations...");

  const departments = await prisma.department.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      branch: true,
    },
  });

  if (departments.length === 0) {
    console.log("No departments found; skipping Designations seeding.");
    return;
  }

  type SeedDesignation = {
    name: string;
    departmentName: string;
  };

  const designations: SeedDesignation[] = [
    { name: "Software Engineer", departmentName: "IT Department" },
    { name: "Senior Software Engineer", departmentName: "IT Department" },
    { name: "IT Manager", departmentName: "IT Department" },
    { name: "HR Manager", departmentName: "HR Department" },
    { name: "HR Officer", departmentName: "HR Department" },
    { name: "Sales Executive", departmentName: "Sales Department" },
    { name: "Sales Manager", departmentName: "Sales Department" },
    { name: "Accountant", departmentName: "Finance Department" },
    { name: "Finance Manager", departmentName: "Finance Department" },
    { name: "Marketing Specialist", departmentName: "Marketing Department" },
    { name: "Marketing Manager", departmentName: "Marketing Department" },
    { name: "Operations Supervisor", departmentName: "Operations Department" },
    { name: "Customer Support", departmentName: "Support Department" },
  ];

  const departmentByName: Record<string, string> = {};
  for (const d of departments) {
    departmentByName[d.name] = d.id;
  }

  let createdCount = 0;

  for (const des of designations) {
    const departmentId = departmentByName[des.departmentName];

    if (!departmentId) {
      console.log(
        `Skipping designation "${des.name}" because department "${des.departmentName}" not found.`,
      );
      continue;
    }

    const existing = await prisma.designation.findFirst({
      where: {
        name: des.name,
        departmentId,
      },
    });

    if (existing) {
      continue;
    }

    await prisma.designation.create({
      data: {
        name: des.name,
        departmentId,
      },
    });

    createdCount++;
    console.log(`Designation created: ${des.name} (${des.departmentName})`);
  }

  console.log(`Designations seeding completed. New records: ${createdCount}`);
}

