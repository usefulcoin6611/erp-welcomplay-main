export async function seedJobStages(prisma: any) {
  console.log("Seeding Job Stages...");

  const stages: { name: string; order: number }[] = [
    { name: "Applied", order: 1 },
    { name: "Screening", order: 2 },
    { name: "Interview", order: 3 },
    { name: "Offer", order: 4 },
    { name: "Hired", order: 5 },
    { name: "Rejected", order: 6 },
  ];

  let createdCount = 0;

  for (const stage of stages) {
    const existing = await prisma.jobStage.findFirst({
      where: { name: stage.name },
    });

    if (existing) {
      continue;
    }

    await prisma.jobStage.create({
      data: {
        name: stage.name,
        order: stage.order,
      },
    });

    createdCount++;
    console.log(`Job Stage created: ${stage.order} - ${stage.name}`);
  }

  console.log(`Job Stages seeding completed. New records: ${createdCount}`);
}

