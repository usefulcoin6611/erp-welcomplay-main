type SeedTracker = {
  projectId: string;
  taskKey?: string;
  name: string;
  startTime: Date;
  endTime: Date;
  isBillable?: boolean;
  userName?: string;
};

export async function seedTimeTrackers(prisma: any) {
  console.log("Seeding time trackers...");

  const existing = await prisma.timeTracker.findFirst();
  if (existing) {
    console.log("Skipping time tracker seed: records already exist.");
    return;
  }

  const tasks = await prisma.projectTask.findMany({
    where: {
      taskKey: {
        in: ["TASK-PRJ-001-1", "TASK-PRJ-001-2", "TASK-PRJ-002-1"],
      },
    },
  });

  const taskByKey: Record<string, any> = {};
  for (const t of tasks) {
    taskByKey[t.taskKey] = t;
  }

  const base: SeedTracker[] = [
    {
      projectId: "PRJ-001",
      taskKey: "TASK-PRJ-001-1",
      name: "Setup Chart of Accounts",
      startTime: new Date("2025-10-02T09:00:00"),
      endTime: new Date("2025-10-02T13:30:00"),
      isBillable: true,
      userName: "Budi",
    },
    {
      projectId: "PRJ-001",
      taskKey: "TASK-PRJ-001-2",
      name: "Migrasi Data Awal",
      startTime: new Date("2025-10-05T08:00:00"),
      endTime: new Date("2025-10-05T14:00:00"),
      isBillable: true,
      userName: "Sari",
    },
    {
      projectId: "PRJ-002",
      taskKey: "TASK-PRJ-002-1",
      name: "Desain Pipeline CRM",
      startTime: new Date("2025-12-10T10:00:00"),
      endTime: new Date("2025-12-10T16:30:00"),
      isBillable: true,
      userName: "Ahmad",
    },
  ];

  let createdCount = 0;

  for (const tr of base) {
    const task =
      tr.taskKey && taskByKey[tr.taskKey] ? taskByKey[tr.taskKey] : null;

    const totalSeconds = Math.max(
      0,
      Math.floor((tr.endTime.getTime() - tr.startTime.getTime()) / 1000),
    );

    await prisma.timeTracker.create({
      data: {
        projectId: tr.projectId,
        taskId: task ? task.id : null,
        name: tr.name,
        isActive: false,
        isBillable: tr.isBillable ?? false,
        startTime: tr.startTime,
        endTime: tr.endTime,
        totalSeconds,
        userName: tr.userName ?? null,
      },
    });

    createdCount++;
  }

  console.log(
    `Time trackers seeding completed. New records: ${createdCount}`,
  );
}

