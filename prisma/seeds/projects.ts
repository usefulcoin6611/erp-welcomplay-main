type SeedProject = {
  projectId: string;
  name: string;
  clientName: string;
  status: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  estimatedHrs: number;
  description: string;
  tags: string | null;
};

export async function seedProjects(prisma: any) {
  console.log("Seeding projects...");

  const user = await prisma.user.findFirst({
    where: {
      role: {
        in: ["super admin", "company", "employee"],
      },
      branchId: {
        not: null,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!user || !user.branchId) {
    console.log("Skipping project seed: User with branchId not found.");
    return;
  }

  const branchId = user.branchId;
  const createdById = user.id;

  const baseProjects: SeedProject[] = [
    {
      projectId: "PRJ-001",
      name: "Implementasi ERP PT Maju Jaya",
      clientName: "PT Maju Jaya",
      status: "in_progress",
      startDate: new Date("2025-10-01"),
      endDate: new Date("2026-01-31"),
      budget: 750000000,
      estimatedHrs: 1200,
      description:
        "Implementasi sistem ERP lengkap untuk otomasi proses akuntansi, HR, dan operasional.",
      tags: "ERP,Implementasi,Keuangan",
    },
    {
      projectId: "PRJ-002",
      name: "CRM Upgrade CV Kreatif Digital",
      clientName: "CV Kreatif Digital",
      status: "not_started",
      startDate: new Date("2025-11-10"),
      endDate: new Date("2026-03-15"),
      budget: 280000000,
      estimatedHrs: 600,
      description:
        "Upgrade modul CRM untuk meningkatkan tracking leads dan integrasi dengan email marketing.",
      tags: "CRM,Sales,Marketing",
    },
    {
      projectId: "PRJ-003",
      name: "Website Redesign PT Teknologi",
      clientName: "PT Teknologi Nusantara",
      status: "on_hold",
      startDate: new Date("2025-09-15"),
      endDate: new Date("2026-02-28"),
      budget: 150000000,
      estimatedHrs: 420,
      description:
        "Redesign website perusahaan dengan fokus pada performa dan pengalaman pengguna.",
      tags: "Website,UI/UX,Frontend",
    },
    {
      projectId: "PRJ-004",
      name: "Mobile App Development",
      clientName: "PT Layanan Digital",
      status: "in_progress",
      startDate: new Date("2025-08-01"),
      endDate: new Date("2026-05-31"),
      budget: 520000000,
      estimatedHrs: 900,
      description:
        "Pengembangan aplikasi mobile untuk layanan pelanggan dan pelacakan transaksi.",
      tags: "Mobile,Android,iOS",
    },
    {
      projectId: "PRJ-005",
      name: "Cloud Migration Project",
      clientName: "PT Infrastruktur Data",
      status: "finished",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      budget: 980000000,
      estimatedHrs: 1600,
      description:
        "Migrasi infrastruktur on-premise ke cloud dengan minimal downtime.",
      tags: "Cloud,Migrasi,Infra",
    },
  ];

  const existing = await prisma.project.findMany({
    where: {
      projectId: {
        in: baseProjects.map((p) => p.projectId),
      },
      branchId,
    },
  });

  const existingIds = new Set<string>(
    existing.map((p: any) => String(p.projectId)),
  );

  const usersInBranch = await prisma.employee.findMany({
    where: {
      branch: branchId,
    },
    orderBy: { createdAt: "asc" },
  });

  const userNames =
    usersInBranch.length > 0
      ? usersInBranch.map((e: any) => e.name).filter((n: any) => !!n)
      : ["Budi Santoso", "Sari Wijaya", "Ahmad Fauzi", "Dewi Lestari"];

  for (const bp of baseProjects) {
    if (existingIds.has(bp.projectId)) {
      console.log(`Project exists: ${bp.projectId}`);
      continue;
    }

    const assignedUsers =
      userNames.length <= 3
        ? userNames
        : userNames.slice(0, 3);

    const progress =
      bp.status === "finished"
        ? 100
        : bp.status === "not_started"
        ? 0
        : 60;

    await prisma.project.create({
      data: {
        projectId: bp.projectId,
        branchId,
        name: bp.name,
        clientName: bp.clientName,
        status: bp.status,
        startDate: bp.startDate,
        endDate: bp.endDate,
        budget: bp.budget,
        estimatedHrs: bp.estimatedHrs,
        progress,
        description: bp.description,
        tags: bp.tags,
        users: assignedUsers,
        createdById,
      },
    });

    console.log(`Project created: ${bp.projectId} - ${bp.name}`);
  }

  console.log("Projects seeding completed.");
}
