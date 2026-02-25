export async function seedProjectTaskStages(prisma: any) {
  console.log("Seeding Project Task Stages...");

  const stages: { name: string; order: number }[] = [
    { name: "Planning", order: 1 },
    { name: "In Progress", order: 2 },
    { name: "On Hold", order: 3 },
    { name: "Review", order: 4 },
    { name: "Completed", order: 5 },
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

