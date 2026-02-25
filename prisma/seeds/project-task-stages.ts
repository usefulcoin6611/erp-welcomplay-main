export async function seedProjectTaskStages(prisma: any) {
  console.log("Seeding Project Task Stages...");

  const stages: { name: string; order: number }[] = [
    { name: "To Do", order: 1 },
    { name: "Planning", order: 2 },
    { name: "In Progress", order: 3 },
    { name: "On Hold", order: 4 },
    { name: "Review", order: 5 },
    { name: "Completed", order: 6 },
  ];

  let createdCount = 0;

  for (const stage of stages) {
    const existing = await prisma.projectTaskStage.findFirst({
      where: { name: stage.name },
    });

    if (existing) {
      continue;
    }

    await prisma.projectTaskStage.create({
      data: {
        name: stage.name,
        order: stage.order,
      },
    });

    createdCount++;
    console.log(`Project Task Stage created: ${stage.order} - ${stage.name}`);
  }

  console.log(`Project Task Stages seeding completed. New records: ${createdCount}`);
}

