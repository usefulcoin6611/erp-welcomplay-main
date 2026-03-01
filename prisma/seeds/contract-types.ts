/**
 * Seed contract types for /pipelines?tab=contract-type.
 * Used by seedCrmPipelines and can be run standalone via db:seed:contract-types.
 */
export const CONTRACT_TYPE_NAMES = [
  "Implementasi",
  "Dukungan & Pemeliharaan",
  "Pengembangan",
  "Migrasi Sistem",
  "Audit & Konsultasi",
  "Pelatihan",
  "Integrasi Sistem",
  "Konsultasi",
] as const;

export async function seedContractTypes(prisma: any) {
  let created = 0;
  for (const name of CONTRACT_TYPE_NAMES) {
    const existing = await prisma.contractType.findFirst({
      where: { name },
    });
    if (existing) continue;
    await prisma.contractType.create({
      data: { name },
    });
    created++;
    console.log(`Contract type created: ${name}`);
  }
  console.log(`Contract types seeding completed. New records: ${created}`);
  return created;
}
