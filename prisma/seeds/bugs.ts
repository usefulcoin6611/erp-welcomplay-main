type SeedBug = {
  bugKey: string;
  projectId: string;
  title: string;
  priority: string;
  startDate?: Date;
  dueDate?: Date;
  description?: string;
  statusTitle: string;
  createdBy?: string;
  assignedTo?: string[];
  attachments?: number;
  comments?: number;
};

export async function seedBugs(prisma: any) {
  console.log("Seeding project bugs...");

  if (!prisma.bug) {
    console.warn("Prisma client has no bug model. Skipping bugs seed.");
    return;
  }

  try {
    const existing = await prisma.bug.findFirst();
    if (existing) {
      console.log("Skipping bug seed: records already exist.");
      return;
    }
  } catch (err: unknown) {
    const isTableMissing =
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2021";
    if (isTableMissing) {
      console.warn("Table bug does not exist. Run: pnpm prisma migrate deploy. Skipping bugs seed.");
      return;
    }
    throw err;
  }

  let statuses: any[] = [];
  try {
    statuses = await prisma.bugStatus.findMany();
  } catch (err: unknown) {
    const isTableMissing =
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2021";
    if (isTableMissing) {
      console.warn("Table bug_status does not exist. Skipping bugs seed.");
      return;
    }
    throw err;
  }
  const statusByTitle: Record<string, any> = {};
  for (const s of statuses) {
    statusByTitle[s.title] = s;
  }

  const base: SeedBug[] = [
    {
      bugKey: "BUG-PRJ-001-1",
      projectId: "PRJ-001",
      title: "Login page not loading",
      priority: "high",
      startDate: new Date("2025-11-10"),
      dueDate: new Date("2025-12-15"),
      description:
        "Halaman login tidak memuat setelah update terakhir. Error di konsol: timeout pada assets.",
      statusTitle: "Confirmed",
      createdBy: "Budi Santoso",
      assignedTo: ["Sari Wijaya"],
      attachments: 2,
      comments: 3,
    },
    {
      bugKey: "BUG-PRJ-002-1",
      projectId: "PRJ-002",
      title: "Database connection timeout",
      priority: "critical",
      startDate: new Date("2025-11-18"),
      dueDate: new Date("2025-12-10"),
      description: "Koneksi database timeout saat load report.",
      statusTitle: "In Progress",
      createdBy: "Dewi Lestari",
      assignedTo: ["Fauzi Rahman"],
      attachments: 1,
      comments: 1,
    },
    {
      bugKey: "BUG-PRJ-003-1",
      projectId: "PRJ-003",
      title: "Button alignment issue",
      priority: "low",
      startDate: new Date("2025-11-10"),
      dueDate: new Date("2025-11-30"),
      description:
        "Tombol di form tidak sejajar pada layar mobile di beberapa resolusi.",
      statusTitle: "Resolved",
      createdBy: "Ahmad Fauzi",
      assignedTo: ["Budi Santoso"],
      attachments: 0,
      comments: 1,
    },
    {
      bugKey: "BUG-PRJ-004-1",
      projectId: "PRJ-004",
      title: "API endpoint returning 500 error",
      priority: "high",
      startDate: new Date("2025-11-22"),
      dueDate: new Date("2025-12-20"),
      description:
        "Endpoint /api/users mengembalikan 500 saat payload besar dikirim.",
      statusTitle: "Confirmed",
      createdBy: "Sari Wijaya",
      assignedTo: ["Ahmad Fauzi"],
      attachments: 0,
      comments: 0,
    },
    {
      bugKey: "BUG-PRJ-005-1",
      projectId: "PRJ-005",
      title: "Missing validation on form",
      priority: "medium",
      startDate: new Date("2025-12-01"),
      dueDate: new Date("2026-01-05"),
      description: "Form upload tidak melakukan validasi tipe file.",
      statusTitle: "New",
      createdBy: "Budi Santoso",
      assignedTo: ["Dewi Lestari"],
      attachments: 0,
      comments: 0,
    },
  ];

  let createdCount = 0;

  for (const b of base) {
    try {
      const status = statusByTitle[b.statusTitle];

      await prisma.bug.create({
        data: {
          bugKey: b.bugKey,
          projectId: b.projectId,
          title: b.title,
          priority: b.priority,
          startDate: b.startDate ?? null,
          dueDate: b.dueDate ?? null,
          description: b.description ?? null,
          statusId: status ? status.id : null,
          createdBy: b.createdBy ?? null,
          assignedTo: b.assignedTo ?? [],
          attachments: b.attachments ?? 0,
          comments: b.comments ?? 0,
        },
      });

      createdCount++;
      console.log(`Bug created: ${b.bugKey} - ${b.title}`);
    } catch (err: unknown) {
      const isTableMissing =
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code?: string }).code === "P2021";
      if (isTableMissing) {
        console.warn("Table bug does not exist. Skipping bugs seed.");
        return;
      }
      throw err;
    }
  }

  console.log(`Project bugs seeding completed. New records: ${createdCount}`);
}

