export async function seedCompanyPolicies(prisma: any) {
  console.log("Seeding company policies...");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS company_policies (
      id SERIAL PRIMARY KEY,
      branch TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NULL,
      attachment TEXT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const countRows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count
    FROM company_policies
  `;

  const hasExisting = Number(countRows[0]?.count ?? 0) > 0;
  if (hasExisting) {
    console.log("Company policies already exist, skipping seeding.");
    return;
  }

  const branches = await prisma.branch.findMany({
    orderBy: { createdAt: "asc" },
  });

  if (!branches.length) {
    console.warn("No branches found, skipping company policies seeding.");
    return;
  }

  const mainBranch = branches[0].name;
  const otherBranch = branches[1]?.name ?? mainBranch;

  const policies = [
    {
      branch: mainBranch,
      title: "Kebijakan Struktur dan Skala Upah",
      description:
        "Kebijakan penetapan gaji pokok, tunjangan tetap, dan penyesuaian upah sesuai regulasi pengupahan Indonesia.",
    },
    {
      branch: mainBranch,
      title: "Kebijakan THR Keagamaan",
      description:
        "Mengatur perhitungan, jadwal pembayaran, dan kriteria penerima Tunjangan Hari Raya (THR) sesuai aturan pemerintah.",
    },
    {
      branch: otherBranch,
      title: "Kebijakan Lembur dan Uang Makan",
      description:
        "Prosedur persetujuan lembur, perhitungan tarif lembur, serta pemberian uang makan dan transport lembur.",
    },
    {
      branch: otherBranch,
      title: "Kebijakan Kehadiran dan Cuti",
      description:
        "Aturan jam kerja, toleransi keterlambatan, absensi, cuti tahunan, cuti sakit, cuti melahirkan, dan cuti khusus.",
    },
    {
      branch: mainBranch,
      title: "Kebijakan Reimbursement dan Medical Claim",
      description:
        "Proses pengajuan dan persetujuan klaim biaya kesehatan, operasional, serta batas plafon per level jabatan.",
    },
    {
      branch: mainBranch,
      title: "Kebijakan Work From Home (WFH)",
      description:
        "Panduan kerja jarak jauh termasuk kriteria kelayakan, jam kerja, target harian, dan kewajiban pelaporan.",
    },
    {
      branch: mainBranch,
      title: "Kebijakan Disiplin dan Kode Etik Karyawan",
      description:
        "Standar etika, kerahasiaan data, penggunaan aset perusahaan, serta sanksi pelanggaran disiplin.",
    },
  ];

  for (const policy of policies) {
    await prisma.$queryRaw`
      INSERT INTO company_policies (branch, title, description)
      VALUES (${policy.branch}, ${policy.title}, ${policy.description})
    `;
  }

  console.log("Company policies seeding completed.");
}

