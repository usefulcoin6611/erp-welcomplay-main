import { TRAINING_STATUS_OPTIONS, TRAINING_PERFORMANCE_OPTIONS } from "@/lib/training-data";

export async function seedTrainings(prisma: any) {
  console.log("Seeding Trainings...");

  const trainingTypes: { id: string; name: string }[] =
    await prisma.trainingType.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    });
  const trainers: { id: string; branch: string }[] =
    await prisma.trainer.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, branch: true },
    });
  const employees: { id: string; name: string; branch: string }[] =
    await prisma.employee.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, branch: true },
    });

  if (!trainingTypes.length || !trainers.length || !employees.length) {
    console.log(
      "Skipping Trainings seeding: require training types, trainers, and employees to exist.",
    );
    return;
  }

  const pick = <T,>(arr: T[], idx: number) => arr[idx % arr.length];

  const items = [
    {
      branch: employees[0]?.branch ?? "Pusat Jakarta",
      trainingType: "Technical Training",
      employeeIdx: 0,
      trainerIdx: 0,
      status: "Completed" as (typeof TRAINING_STATUS_OPTIONS)[number],
      startDate: "2024-01-15",
      endDate: "2024-01-19",
      cost: 5_000_000,
      description:
        "Pelatihan technical skills untuk pengembangan kemampuan programming.",
      performance: "Excellent" as (typeof TRAINING_PERFORMANCE_OPTIONS)[number],
    },
    {
      branch: employees[1]?.branch ?? "Cabang Bandung",
      trainingType: "Leadership Training",
      employeeIdx: 1,
      trainerIdx: 1,
      status: "Started" as (typeof TRAINING_STATUS_OPTIONS)[number],
      startDate: "2024-02-01",
      endDate: "2024-02-28",
      cost: 7_500_000,
      description: "Program pengembangan kepemimpinan.",
      performance: "Satisfactory" as (typeof TRAINING_PERFORMANCE_OPTIONS)[number],
    },
    {
      branch: employees[2]?.branch ?? "Pusat Jakarta",
      trainingType: "Customer Service",
      employeeIdx: 2,
      trainerIdx: 2,
      status: "Pending" as (typeof TRAINING_STATUS_OPTIONS)[number],
      startDate: "2024-03-01",
      endDate: "2024-03-05",
      cost: 3_000_000,
      description: "Pelatihan layanan pelanggan.",
      performance: "Not Concluded" as (typeof TRAINING_PERFORMANCE_OPTIONS)[number],
    },
  ];

  let createdCount = 0;

  for (const item of items) {
    const employee = pick(employees, item.employeeIdx);
    const trainer = pick(trainers, item.trainerIdx);
    const trainingType =
      trainingTypes.find((t: any) => t.name === item.trainingType) ??
      trainingTypes[0];

    if (!employee || !trainer || !trainingType) continue;

    const existing = await prisma.training.findFirst({
      where: {
        employeeId: employee.id,
        trainerId: trainer.id,
        trainingTypeId: trainingType.id,
        startDate: new Date(`${item.startDate}T00:00:00.000Z`),
      },
    });

    if (existing) continue;

    await prisma.training.create({
      data: {
        branch: item.branch,
        trainerOption: "Internal",
        trainingTypeId: trainingType.id,
        employeeId: employee.id,
        trainerId: trainer.id,
        status: item.status,
        startDate: new Date(`${item.startDate}T00:00:00.000Z`),
        endDate: new Date(`${item.endDate}T00:00:00.000Z`),
        cost: item.cost,
        description: item.description,
        performance: item.performance,
      },
    });

    createdCount++;
    console.log(
      `Training created: ${trainingType.name} - ${employee.name} (${item.status})`,
    );
  }

  console.log(`Trainings seeding completed. New records: ${createdCount}`);
}

