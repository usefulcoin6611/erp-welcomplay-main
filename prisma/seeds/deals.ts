export async function seedDeals(prisma: any) {
  console.log("Seeding deals...");

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
    console.log("Skipping deal seed: User with branchId not found.");
    return;
  }

  const branchId = user.branchId;

  const pipelineName = "Default Pipeline";

  let pipeline = await prisma.pipeline.findFirst({
    where: {
      name: pipelineName,
      branchId,
    },
  });

  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        name: pipelineName,
        branchId,
      },
    });
  }

  const stageDefinitions = [
    { name: "Proposal Sent", order: 0 },
    { name: "Negotiation", order: 1 },
    { name: "Won", order: 2 },
    { name: "Lost", order: 3 },
  ];

  const stagesByName: Record<string, string> = {};

  for (const s of stageDefinitions) {
    let stage = await prisma.leadStage.findFirst({
      where: {
        name: s.name,
        pipelineId: pipeline.id,
      },
    });

    if (!stage) {
      stage = await prisma.leadStage.create({
        data: {
          name: s.name,
          order: s.order,
          pipelineId: pipeline.id,
        },
      });
    }

    stagesByName[s.name] = stage.id;
  }

  const deals = [
    {
      dealId: "DEAL-001",
      name: "Implementasi ERP PT Maju Jaya",
      client: "PT Maju Jaya",
      pipelineId: pipeline.id,
      stageId: stagesByName["Proposal Sent"],
      price: 350000000,
      status: "Open",
      branchId,
      isActive: true,
      tasksTotal: 5,
      tasksCompleted: 3,
      productsCount: 2,
      sourcesCount: 1,
      labels: [
        { id: "lbl-1", name: "Priority", color: "blue" },
        { id: "lbl-2", name: "Enterprise", color: "purple" },
      ],
      users: [
        { id: "1", name: "John Doe", avatar: "" },
        { id: "2", name: "Jane Smith", avatar: "" },
      ],
      createdAt: new Date("2025-11-02"),
    },
    {
      dealId: "DEAL-002",
      name: "CRM Upgrade CV Kreatif Digital",
      client: "CV Kreatif Digital",
      pipelineId: pipeline.id,
      stageId: stagesByName["Negotiation"],
      price: 180000000,
      status: "Open",
      branchId,
      isActive: true,
      tasksTotal: 8,
      tasksCompleted: 2,
      productsCount: 1,
      sourcesCount: 2,
      labels: [{ id: "lbl-3", name: "Follow Up", color: "amber" }],
      users: [{ id: "3", name: "Bob Johnson", avatar: "" }],
      createdAt: new Date("2025-11-05"),
    },
  ];

  const now = new Date();
  for (const deal of deals) {
    try {
      await prisma.deal.upsert({
        where: { dealId: deal.dealId },
        update: {},
        create: {
          ...deal,
          updatedAt: now,
        },
      });
    } catch (err: unknown) {
      const isColumnNotFound =
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code?: string }).code === "P2022";
      if (isColumnNotFound) {
        // Tabel deal belum punya kolom dari schema (mis. phone). Upsert pakai kolom dasar saja.
        const id = (deal as { id?: string }).id ?? `deal-${deal.dealId}`;
        const labelsJson = JSON.stringify(deal.labels ?? null);
        const usersJson = JSON.stringify(deal.users ?? null);
        await (prisma as any).$executeRawUnsafe(
          `INSERT INTO deal (id, "dealId", "branchId", name, client, price, "pipelineId", "stageId", status, "isActive", "tasksTotal", "tasksCompleted", "productsCount", "sourcesCount", labels, users, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, $16::jsonb, $17, $18)
           ON CONFLICT ("dealId") DO UPDATE SET
             name = EXCLUDED.name, client = EXCLUDED.client, price = EXCLUDED.price,
             "pipelineId" = EXCLUDED."pipelineId", "stageId" = EXCLUDED."stageId",
             status = EXCLUDED.status, "isActive" = EXCLUDED."isActive",
             "tasksTotal" = EXCLUDED."tasksTotal", "tasksCompleted" = EXCLUDED."tasksCompleted",
             "productsCount" = EXCLUDED."productsCount", "sourcesCount" = EXCLUDED."sourcesCount",
             labels = EXCLUDED.labels, users = EXCLUDED.users,
             "updatedAt" = EXCLUDED."updatedAt"`,
          id,
          deal.dealId,
          deal.branchId ?? null,
          deal.name,
          deal.client ?? null,
          deal.price,
          deal.pipelineId ?? null,
          deal.stageId ?? null,
          deal.status,
          deal.isActive,
          deal.tasksTotal ?? 0,
          deal.tasksCompleted ?? 0,
          deal.productsCount ?? 0,
          deal.sourcesCount ?? 0,
          labelsJson,
          usersJson,
          deal.createdAt,
          now
        );
      } else {
        throw err;
      }
    }
  }

  console.log(`Seeded ${deals.length} deals.`);
}
