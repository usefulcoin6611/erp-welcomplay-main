type SeedTimesheet = {
  projectId: string;
  taskKey?: string;
  date: Date;
  minutes: number;
  userName: string;
  description?: string;
};

export async function seedTimesheets(prisma: any) {
  console.log("Seeding timesheets...");

  if (!prisma.timesheet) {
    console.warn("Prisma client has no timesheet model. Skipping timesheets seed.");
    return;
  }

  try {
    const existing = await prisma.timesheet.findFirst();
    if (existing) {
      console.log("Skipping timesheet seed: records already exist.");
      return;
    }
  } catch (err: unknown) {
    const isTableMissing =
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2021";
    if (isTableMissing) {
      console.warn("Table timesheet does not exist. Run: pnpm prisma migrate deploy. Skipping timesheets seed.");
      return;
    }
    throw err;
  }

  let tasks: any[] = [];
  try {
    tasks = await prisma.projectTask.findMany({
      where: {
        taskKey: {
          in: ["TASK-PRJ-001-1", "TASK-PRJ-001-2"],
        },
      },
    });
  } catch (err: unknown) {
    const isTableMissing =
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2021";
    if (isTableMissing) {
      console.warn("Table project_task does not exist. Skipping timesheets seed.");
      return;
    }
    throw err;
  }

  const taskByKey: Record<string, any> = {};
  for (const t of tasks) {
    taskByKey[t.taskKey] = t;
  }

  const base: SeedTimesheet[] = [
    {
      projectId: "PRJ-001",
      taskKey: "TASK-PRJ-001-1",
      date: new Date("2025-10-02"),
      minutes: 270,
      userName: "Budi",
      description: "Setup chart of accounts awal.",
    },
    {
      projectId: "PRJ-001",
      taskKey: "TASK-PRJ-001-2",
      date: new Date("2025-10-05"),
      minutes: 360,
      userName: "Sari",
      description: "Migrasi data awal dari sistem lama.",
    },
  ];

  let createdCount = 0;

  for (const ts of base) {
    try {
      const task =
        ts.taskKey && taskByKey[ts.taskKey] ? taskByKey[ts.taskKey] : null;

      await prisma.timesheet.create({
        data: {
          projectId: ts.projectId,
          taskId: task ? task.id : null,
          date: ts.date,
          minutes: ts.minutes,
          userName: ts.userName,
          description: ts.description ?? null,
        },
      });

      createdCount++;
    } catch (err: unknown) {
      const isTableMissing =
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code?: string }).code === "P2021";
      if (isTableMissing) {
        console.warn("Table timesheet does not exist. Skipping timesheets seed.");
        return;
      }
      throw err;
    }
  }

  console.log(`Timesheets seeding completed. New records: ${createdCount}`);
}

