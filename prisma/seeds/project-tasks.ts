type SeedTask = {
  taskKey: string;
  projectId: string;
  name: string;
  description?: string;
  priority: string;
  stage: string;
  startDate?: Date;
  endDate?: Date;
  estimatedHrs?: number;
  completion?: number;
  attachments?: number;
  comments?: number;
  checklists?: number;
  isOwner?: boolean;
};

export async function seedProjectTasks(prisma: any) {
  console.log("Seeding project tasks...");

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (projects.length === 0) {
    console.log("Skipping task seed: no projects found.");
    return;
  }

  const projectByCode: Record<string, any> = {};
  for (const p of projects) {
    projectByCode[p.projectId] = p;
  }

  const baseTasks: SeedTask[] = [
    {
      taskKey: "TASK-PRJ-001-1",
      projectId: "PRJ-001",
      name: "Setup Database Schema",
      description: "Membuat skema database dan relasi tabel untuk modul awal ERP.",
      priority: "high",
      stage: "In Progress",
      startDate: new Date("2025-11-01"),
      endDate: new Date("2025-12-15"),
      estimatedHrs: 40,
      completion: 75,
      attachments: 3,
      comments: 5,
      checklists: 3,
      isOwner: true,
    },
    {
      taskKey: "TASK-PRJ-001-2",
      projectId: "PRJ-001",
      name: "Migrasi Data Awal",
      description: "Migrasi data master dari sistem lama ke ERP.",
      priority: "medium",
      stage: "To Do",
      startDate: new Date("2025-12-05"),
      endDate: new Date("2025-12-20"),
      estimatedHrs: 60,
      completion: 30,
      attachments: 1,
      comments: 2,
      checklists: 2,
      isOwner: false,
    },
    {
      taskKey: "TASK-PRJ-002-1",
      projectId: "PRJ-002",
      name: "Desain Pipeline CRM",
      description: "Mendesain tahapan pipeline untuk proses sales baru.",
      priority: "high",
      stage: "In Progress",
      startDate: new Date("2025-12-10"),
      endDate: new Date("2025-12-25"),
      estimatedHrs: 32,
      completion: 60,
      attachments: 2,
      comments: 3,
      checklists: 2,
      isOwner: true,
    },
    {
      taskKey: "TASK-PRJ-003-1",
      projectId: "PRJ-003",
      name: "Implement Authentication",
      description: "Implementasi modul login & otorisasi pada website baru.",
      priority: "critical",
      stage: "Review",
      startDate: new Date("2025-12-15"),
      endDate: new Date("2025-12-30"),
      estimatedHrs: 24,
      completion: 85,
      attachments: 1,
      comments: 4,
      checklists: 3,
      isOwner: true,
    },
    {
      taskKey: "TASK-PRJ-004-1",
      projectId: "PRJ-004",
      name: "Write API Documentation",
      description: "Menulis dokumentasi API untuk aplikasi mobile.",
      priority: "medium",
      stage: "In Progress",
      startDate: new Date("2025-12-20"),
      endDate: new Date("2026-01-05"),
      estimatedHrs: 20,
      completion: 40,
      attachments: 1,
      comments: 1,
      checklists: 1,
      isOwner: false,
    },
    {
      taskKey: "TASK-PRJ-005-1",
      projectId: "PRJ-005",
      name: "Optimize Database Queries",
      description: "Optimasi query untuk modul laporan pasca migrasi cloud.",
      priority: "high",
      stage: "In Progress",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-15"),
      estimatedHrs: 36,
      completion: 50,
      attachments: 2,
      comments: 2,
      checklists: 2,
      isOwner: true,
    },
  ];

  let createdCount = 0;

  for (const bt of baseTasks) {
    const project = projectByCode[bt.projectId];
    if (!project) {
      continue;
    }

    const existing = await prisma.projectTask.findFirst({
      where: { taskKey: bt.taskKey },
    });

    if (existing) {
      continue;
    }

    const users = Array.isArray(project.users) ? (project.users as string[]) : [];

    await prisma.projectTask.create({
      data: {
        taskKey: bt.taskKey,
        projectId: bt.projectId,
        name: bt.name,
        description: bt.description ?? null,
        estimatedHrs: bt.estimatedHrs ?? 0,
        startDate: bt.startDate ?? project.startDate ?? null,
        endDate: bt.endDate ?? project.endDate ?? null,
        priority: bt.priority,
        stage: bt.stage,
        assignedTo:
          users.length > 0
            ? users.slice(0, bt.isOwner ? 2 : 1)
            : ["Budi Santoso", "Sari Wijaya"],
        completion: bt.completion ?? 0,
        attachments: bt.attachments ?? 0,
        comments: bt.comments ?? 0,
        checklists: bt.checklists ?? 0,
        isOwner: bt.isOwner ?? false,
      },
    });

    createdCount++;
    console.log(`ProjectTask created: ${bt.taskKey} - ${bt.name}`);
  }

  console.log(`Project tasks seeding completed. New records: ${createdCount}`);
}

