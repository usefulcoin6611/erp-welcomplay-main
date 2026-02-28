export async function seedLeads(prisma: any) {
  console.log("Seeding leads...");

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
    console.log("Skipping lead seed: User with branchId not found.");
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

  // Updated stage definitions: Draft, Sent, Open, Revised, Declined
  const stageDefinitions = [
    { name: "Draft", order: 0 },
    { name: "Sent", order: 1 },
    { name: "Open", order: 2 },
    { name: "Revised", order: 3 },
    { name: "Declined", order: 4 },
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

  const leads = [
    {
      leadId: "LEAD-001",
      name: "PT Maju Jaya",
      subject: "Implementasi ERP",
      email: "contact@majujaya.id",
      phone: "+62 21 555 1234",
      pipelineId: pipeline.id,
      stageId: stagesByName["Draft"],
      ownerId: user.id,
      branchId,
      isActive: true,
      date: new Date("2025-11-01"),
    },
    {
      leadId: "LEAD-002",
      name: "CV Kreatif Digital",
      subject: "Upgrade CRM",
      email: "halo@kreatifdigital.co.id",
      phone: "+62 812 3456 7890",
      pipelineId: pipeline.id,
      stageId: stagesByName["Sent"],
      ownerId: user.id,
      branchId,
      isActive: true,
      date: new Date("2025-11-03"),
    },
    {
      leadId: "LEAD-003",
      name: "PT Sumber Makmur",
      subject: "Integrasi POS",
      email: "info@sumbermakmur.co.id",
      phone: "+62 31 567 8901",
      pipelineId: pipeline.id,
      stageId: stagesByName["Open"],
      ownerId: user.id,
      branchId,
      isActive: true,
      date: new Date("2025-11-05"),
    },
    {
      leadId: "LEAD-004",
      name: "UD Berkah Jaya",
      subject: "Software Akuntansi",
      email: "berkah@email.com",
      phone: "+62 812 9876 5432",
      pipelineId: pipeline.id,
      stageId: stagesByName["Revised"],
      ownerId: user.id,
      branchId,
      isActive: true,
      date: new Date("2025-11-07"),
    },
    {
      leadId: "LEAD-005",
      name: "PT Teknologi Nusantara",
      subject: "Sistem HR Terpadu",
      email: "info@teknologinusantara.id",
      phone: "+62 21 888 9999",
      pipelineId: pipeline.id,
      stageId: stagesByName["Declined"],
      ownerId: user.id,
      branchId,
      isActive: true,
      date: new Date("2025-11-09"),
    },
  ];

  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { leadId: lead.leadId },
      update: {},
      create: lead,
    });
  }

  console.log(`Seeded ${leads.length} leads.`);
}
