export async function seedDocumentUploads(prisma: any) {
  console.log("Seeding HRM document uploads...");

  // Pastikan tabel ada (selaras dengan API /api/hrm/documents)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS document_uploads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      document TEXT NULL,
      role TEXT NOT NULL,
      description TEXT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  const countRows = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::bigint AS count
    FROM document_uploads
  `;

  const hasExisting = Number(countRows[0]?.count ?? 0) > 0;
  if (hasExisting) {
    console.log("Document uploads already exist, skipping seeding.");
    return;
  }

  // Role mengikuti konstanta ROLES di /hrm/documents:
  // 0: All, 1: Admin, 2: Employee, 3: HR Manager, 4: Manager
  const documents = [
    {
      name: "KTP Karyawan",
      role: "2",
      description:
        "Dokumen identitas wajib untuk setiap karyawan sebagai dasar penggajian dan pelaporan pajak.",
    },
    {
      name: "Kartu Keluarga",
      role: "2",
      description:
        "Digunakan untuk keperluan BPJS, tunjangan keluarga, dan administrasi HR lainnya.",
    },
    {
      name: "NPWP Karyawan",
      role: "2",
      description:
        "Diperlukan untuk perhitungan PPh 21 dan pelaporan pajak penghasilan karyawan.",
    },
    {
      name: "Kontrak Kerja Karyawan Tetap",
      role: "1",
      description:
        "Template kontrak kerja standar yang digunakan untuk karyawan tetap di seluruh cabang.",
    },
    {
      name: "Perjanjian Kerja Waktu Tertentu (PKWT)",
      role: "3",
      description:
        "Template PKWT untuk karyawan kontrak sesuai regulasi ketenagakerjaan Indonesia.",
    },
    {
      name: "Formulir Pengajuan Cuti",
      role: "4",
      description:
        "Formulir standar pengajuan cuti tahunan, cuti sakit, dan cuti khusus yang di-approve atasan.",
    },
    {
      name: "Formulir Klaim Reimbursement",
      role: "1",
      description:
        "Digunakan untuk klaim biaya operasional, perjalanan dinas, dan biaya medis sesuai kebijakan perusahaan.",
    },
  ];

  for (const doc of documents) {
    await prisma.$queryRaw`
      INSERT INTO document_uploads (name, document, role, description)
      VALUES (${doc.name}, NULL, ${doc.role}, ${doc.description})
    `;
  }

  console.log("HRM document uploads seeding completed.");
}

