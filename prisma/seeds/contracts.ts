/**
 * Seed contracts with related data in sync:
 * - type: from ContractType table (/pipelines?tab=contract-type)
 * - clientName: from Customer table
 * - projectId: from Project table (optional)
 * - createdById: from User (same branch)
 */
export async function seedContracts(prisma: any) {
  const db = prisma as any;
  console.log("Seeding contracts...");

  const user = await prisma.user.findFirst({
    where: {
      role: { in: ["super admin", "company", "employee"] },
      branchId: { not: null },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!user?.branchId) {
    console.log("Skipping contract seed: User with branchId not found.");
    return;
  }

  const branchId = user.branchId as string;
  const createdById = user.id;

  const [contractTypes, customersInBranch, customersAny, projects] = await Promise.all([
    prisma.contractType.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.customer.findMany({ where: { branchId }, orderBy: { createdAt: "asc" }, select: { name: true } }),
    prisma.customer.findMany({ orderBy: { createdAt: "asc" }, take: 20, select: { name: true } }),
    prisma.project.findMany({ where: { branchId }, orderBy: { createdAt: "asc" }, select: { projectId: true } }),
  ]);

  const typeNames = (contractTypes as { name: string }[]).map((t) => t.name);
  const customers = customersInBranch.length > 0 ? customersInBranch : customersAny;
  const clientNames = (customers as { name: string }[]).map((c) => c.name);
  const projectIds = (projects as { projectId: string }[]).map((p) => p.projectId);

  if (typeNames.length === 0) {
    console.log("Skipping contract seed: No contract types found. Run contract-types seed first.");
    return;
  }
  if (clientNames.length === 0) {
    console.log("Skipping contract seed: No customers found. Run customer seed first.");
    return;
  }

  const typesToUse = typeNames;

  const contractDefs = [
    { subject: "Implementasi ERP", value: 350_000_000, typeIndex: 0, description: "Kontrak implementasi ERP full module selama 3 bulan.", status: "accept" as const, start: "2025-11-01", end: "2026-01-31" },
    { subject: "Maintenance CRM", value: 120_000_000, typeIndex: 1, description: "Maintenance dan support tahunan untuk modul CRM.", status: "accept" as const, start: "2025-11-10", end: "2026-11-09" },
    { subject: "Development Mobile App", value: 500_000_000, typeIndex: 2, description: "Pengembangan aplikasi mobile untuk platform iOS dan Android.", status: "accept" as const, start: "2025-12-01", end: "2026-06-30" },
    { subject: "Cloud Migration Services", value: 250_000_000, typeIndex: 3, description: "Migrasi infrastruktur ke cloud dan optimasi.", status: "pending" as const, start: "2025-10-15", end: "2026-04-14" },
    { subject: "Security Audit & Compliance", value: 180_000_000, typeIndex: 4, description: "Audit keamanan dan compliance standar industri.", status: "accept" as const, start: "2025-09-01", end: "2025-12-31" },
    { subject: "Database Optimization", value: 95_000_000, typeIndex: 5, description: "Optimasi database dan tuning performa.", status: "accept" as const, start: "2025-11-20", end: "2026-02-19" },
    { subject: "E-Commerce Platform Development", value: 750_000_000, typeIndex: 2, description: "Pengembangan platform e-commerce lengkap.", status: "pending" as const, start: "2026-01-01", end: "2026-12-31" },
    { subject: "IT Infrastructure Setup", value: 420_000_000, typeIndex: 0, description: "Setup infrastruktur IT dan jaringan.", status: "accept" as const, start: "2025-10-01", end: "2026-03-31" },
    { subject: "Training & Consultation", value: 75_000_000, typeIndex: 5, description: "Pelatihan dan konsultasi teknis.", status: "accept" as const, start: "2025-11-15", end: "2026-01-14" },
    { subject: "System Integration Services", value: 320_000_000, typeIndex: 6, description: "Integrasi sistem dan API dengan pihak ketiga.", status: "pending" as const, start: "2026-02-01", end: "2026-08-31" },
  ];

  let created = 0;
  for (let i = 0; i < contractDefs.length; i++) {
    const def = contractDefs[i];
    const contractId = `CTR-2025-${String(i + 1).padStart(3, "0")}`;
    const typeName = typesToUse[def.typeIndex % typesToUse.length];
    const clientName = clientNames[i % clientNames.length];
    const projectId = projectIds[i % projectIds.length] ?? null;

    const existing = await db.contract.findUnique({
      where: { contractId },
    });
    if (existing) {
      continue;
    }

    await db.contract.create({
      data: {
        contractId,
        clientName,
        subject: `${def.subject} - ${clientName}`,
        value: def.value,
        type: typeName,
        startDate: new Date(def.start),
        endDate: new Date(def.end),
        description: def.description,
        status: def.status,
        contractDescription: def.description,
        createdById,
        projectId,
      },
    });
    created++;
    console.log(`Contract created: ${contractId} (${clientName}, ${typeName})`);
  }

  console.log(`Contracts seeding completed. New records: ${created}.`);
}
