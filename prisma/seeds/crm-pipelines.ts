export async function seedCrmPipelines(prisma: any) {
  console.log("Seeding CRM Pipelines configuration (stages, sources, labels, contract types)...");

  const hasPipelineModel = Boolean((prisma as any).pipeline);
  const hasLeadStageModel = Boolean((prisma as any).leadStage);
  const hasDealStageModel = Boolean((prisma as any).dealStage);
  const hasSourceModel = Boolean((prisma as any).source);
  const hasPipelineLabelModel = Boolean((prisma as any).pipelineLabel);
  const hasContractTypeModel = Boolean((prisma as any).contractType);

  if (!hasPipelineModel) {
    console.log("Skipping CRM pipeline seed: Pipeline model not available in Prisma client.");
    return;
  }

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
    console.log(
      "Skipping CRM pipeline seed: user with branchId not found. Make sure branches and users are seeded first.",
    );
    return;
  }

  const branchId = user.branchId as string;

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
    console.log(`Pipeline created: ${pipelineName}`);
  } else {
    console.log(`Pipeline found: ${pipelineName}`);
  }

  const leadStageDefinitions: { name: string; order: number }[] = [
    { name: "New", order: 0 },
    { name: "Qualified", order: 1 },
    { name: "Contacted", order: 2 },
    { name: "Proposal Sent", order: 3 },
    { name: "Negotiation", order: 4 },
    { name: "Won", order: 5 },
    { name: "Lost", order: 6 },
  ];

  let leadStageCreated = 0;

  if (hasLeadStageModel) {
    for (const def of leadStageDefinitions) {
      const existing = await prisma.leadStage.findFirst({
        where: {
          pipelineId: pipeline.id,
          name: def.name,
        },
      });

      if (existing) {
        continue;
      }

      await prisma.leadStage.create({
        data: {
          name: def.name,
          order: def.order,
          pipelineId: pipeline.id,
        },
      });
      leadStageCreated++;
      console.log(`Lead stage created: ${def.name}`);
    }
  }

  console.log(
    `Lead stages seeding completed for pipeline "${pipelineName}". New records: ${leadStageCreated}`,
  );

  const dealStageDefinitions: { name: string; order: number }[] = [
    { name: "Proposal Sent", order: 0 },
    { name: "Negotiation", order: 1 },
    { name: "Won", order: 2 },
    { name: "Lost", order: 3 },
  ];

  let dealStageCreated = 0;

  if (hasDealStageModel) {
    for (const def of dealStageDefinitions) {
      const existing = await prisma.dealStage.findFirst({
        where: {
          pipelineId: pipeline.id,
          name: def.name,
        },
      });

      if (existing) {
        continue;
      }

      await prisma.dealStage.create({
        data: {
          name: def.name,
          order: def.order,
          pipelineId: pipeline.id,
        },
      });
      dealStageCreated++;
      console.log(`Deal stage created: ${def.name}`);
    }
  }

  console.log(
    `Deal stages seeding completed for pipeline "${pipelineName}". New records: ${dealStageCreated}`,
  );

  const sourceNames: string[] = [
    "Website",
    "Media Sosial",
    "Referral",
    "Telepon / Cold Call",
    "Email / Kampanye Email",
    "WhatsApp",
    "Pameran & Event",
    "Seminar & Workshop",
  ];

  let sourceCreated = 0;

  if (hasSourceModel) {
    for (const name of sourceNames) {
      const existing = await prisma.source.findFirst({
        where: {
          name,
          branchId,
        },
      });

      if (existing) {
        continue;
      }

      await prisma.source.create({
        data: {
          name,
          branchId,
        },
      });
      sourceCreated++;
      console.log(`Source created: ${name}`);
    }

    console.log(
      `Sources seeding completed for branch. New records: ${sourceCreated}`,
    );
  } else {
    console.log("Skipping Sources seeding: Source model not available.");
  }

  const labelDefinitions: { name: string; color: string }[] = [
    { name: "Panas", color: "#ef4444" },
    { name: "Hangat", color: "#f59e0b" },
    { name: "Dingin", color: "#3b82f6" },
    { name: "VIP", color: "#8b5cf6" },
    { name: "Prioritas", color: "#10b981" },
    { name: "Tindak Lanjut", color: "#ec4899" },
  ];

  let labelCreated = 0;

  if (hasPipelineLabelModel) {
    for (const def of labelDefinitions) {
      const existing = await prisma.pipelineLabel.findFirst({
        where: {
          pipelineId: pipeline.id,
          name: def.name,
        },
      });

      if (existing) {
        continue;
      }

      await prisma.pipelineLabel.create({
        data: {
          pipelineId: pipeline.id,
          name: def.name,
          color: def.color,
        },
      });
      labelCreated++;
      console.log(`Pipeline label created: ${def.name}`);
    }

    console.log(
      `Pipeline labels seeding completed for pipeline "${pipelineName}". New records: ${labelCreated}`,
    );
  } else {
    console.log("Skipping pipeline labels seeding: PipelineLabel model not available.");
  }

  const contractTypeNames: string[] = [
    "Implementasi",
    "Dukungan & Pemeliharaan",
    "Pengembangan",
    "Migrasi Sistem",
    "Audit & Konsultasi",
    "Pelatihan",
    "Integrasi Sistem",
    "Konsultasi",
  ];

  let contractTypeCreated = 0;

  if (hasContractTypeModel) {
    for (const name of contractTypeNames) {
      const existing = await prisma.contractType.findFirst({
        where: { name },
      });

      if (existing) {
        continue;
      }

      await prisma.contractType.create({
        data: { name },
      });
      contractTypeCreated++;
      console.log(`Contract type created: ${name}`);
    }

    console.log(
      `Contract types seeding completed. New records: ${contractTypeCreated}`,
    );
  } else {
    console.log("Skipping contract types seeding: ContractType model not available.");
  }

  const salesPipelineName = "Sales";

  let salesPipeline = await prisma.pipeline.findFirst({
    where: {
      name: salesPipelineName,
      branchId,
    },
  });

  if (!salesPipeline) {
    salesPipeline = await prisma.pipeline.create({
      data: {
        name: salesPipelineName,
        branchId,
      },
    });
    console.log(`Pipeline created: ${salesPipelineName}`);
  } else {
    console.log(`Pipeline found: ${salesPipelineName}`);
  }

  const salesLeadStages: { name: string; order: number }[] = [
    { name: "New Lead", order: 0 },
    { name: "Contacted", order: 1 },
    { name: "Qualified", order: 2 },
    { name: "Demo Scheduled", order: 3 },
    { name: "Proposal Sent", order: 4 },
    { name: "Negotiation", order: 5 },
    { name: "Won", order: 6 },
    { name: "Lost", order: 7 },
  ];

  let salesLeadStageCreated = 0;

  for (const def of salesLeadStages) {
    const existing = await prisma.leadStage.findFirst({
      where: {
        pipelineId: salesPipeline.id,
        name: def.name,
      },
    });

    if (existing) {
      continue;
    }

    await prisma.leadStage.create({
      data: {
        name: def.name,
        order: def.order,
        pipelineId: salesPipeline.id,
      },
    });
    salesLeadStageCreated++;
    console.log(`Sales pipeline lead stage created: ${def.name}`);
  }

  console.log(
    `Lead stages seeding completed for pipeline "${salesPipelineName}". New records: ${salesLeadStageCreated}`,
  );

  const salesDealStages: { name: string; order: number }[] = [
    { name: "Prospecting", order: 0 },
    { name: "Qualification", order: 1 },
    { name: "Proposal Sent", order: 2 },
    { name: "Negotiation", order: 3 },
    { name: "Closed Won", order: 4 },
    { name: "Closed Lost", order: 5 },
  ];

  let salesDealStageCreated = 0;

  for (const def of salesDealStages) {
    const existing = await prisma.dealStage.findFirst({
      where: {
        pipelineId: salesPipeline.id,
        name: def.name,
      },
    });

    if (existing) {
      continue;
    }

    await prisma.dealStage.create({
      data: {
        name: def.name,
        order: def.order,
        pipelineId: salesPipeline.id,
      },
    });
    salesDealStageCreated++;
    console.log(`Sales pipeline deal stage created: ${def.name}`);
  }

  console.log(
    `Deal stages seeding completed for pipeline "${salesPipelineName}". New records: ${salesDealStageCreated}`,
  );

  const salesLabelDefinitions: { name: string; color: string }[] = [
    { name: "Baru", color: "#3b82f6" },
    { name: "Tindak Lanjut", color: "#f59e0b" },
    { name: "Nilai Tinggi", color: "#10b981" },
    { name: "Risiko Churn", color: "#ef4444" },
    { name: "Upsell", color: "#8b5cf6" },
  ];

  let salesLabelCreated = 0;

  if (hasPipelineLabelModel) {
    for (const def of salesLabelDefinitions) {
      const existing = await prisma.pipelineLabel.findFirst({
        where: {
          pipelineId: salesPipeline.id,
          name: def.name,
        },
      });

      if (existing) {
        continue;
      }

      await prisma.pipelineLabel.create({
        data: {
          pipelineId: salesPipeline.id,
          name: def.name,
          color: def.color,
        },
      });
      salesLabelCreated++;
      console.log(`Sales pipeline label created: ${def.name}`);
    }

    console.log(
      `Pipeline labels seeding completed for pipeline "${salesPipelineName}". New records: ${salesLabelCreated}`,
    );
  } else {
    console.log("Skipping Sales pipeline labels seeding: PipelineLabel model not available.");
  }
}
