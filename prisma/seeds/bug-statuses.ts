export async function seedBugStatuses(prisma: any) {
  console.log("Seeding Bug Statuses...");

  const statuses: { title: string; order: number }[] = [
    { title: "New", order: 1 },
    { title: "Confirmed", order: 2 },
    { title: "In Progress", order: 3 },
    { title: "Resolved", order: 4 },
    { title: "Closed", order: 5 },
  ];

  let createdCount = 0;

  for (const status of statuses) {
    const existing = await prisma.bugStatus.findFirst({
      where: { title: status.title },
    });

    if (existing) {
      continue;
    }

    await prisma.bugStatus.create({
      data: {
        title: status.title,
        order: status.order,
      },
    });

    createdCount++;
    console.log(`Bug Status created: ${status.order} - ${status.title}`);
  }

  console.log(`Bug Statuses seeding completed. New records: ${createdCount}`);
}

