export async function seedLeaveTypes(prisma: any) {
  console.log("Seeding Leave Types...");

  const names: string[] = [
    "Annual Leave",
    "Sick Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Unpaid Leave",
    "Emergency Leave",
  ];

  let createdCount = 0;

  for (const name of names) {
    const existing = await prisma.leaveType.findFirst({
      where: { name },
    });

    if (existing) {
      continue;
    }

    await prisma.leaveType.create({
      data: { name },
    });

    createdCount++;
    console.log(`Leave Type created: ${name}`);
  }

  console.log(`Leave Types seeding completed. New records: ${createdCount}`);
}
