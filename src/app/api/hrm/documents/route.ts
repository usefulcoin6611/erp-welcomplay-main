import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { promises as fs } from "fs";
import path from "path";

type DocumentRow = {
  id: number;
  name: string;
  document: string | null;
  role: string;
  description: string | null;
};

async function ensureTable() {
  // Lightweight safeguard so we don't depend on Prisma migrations
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
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTable();

    const rows = await prisma.$queryRaw<DocumentRow[]>`
      SELECT id, name, document, role, description
      FROM document_uploads
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data document" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "super admin" && userRole !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 },
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let name: string | undefined;
    let role: string | undefined;
    let description: string | undefined;
    let documentPath: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      name = String(form.get("name") ?? "");
      role = String(form.get("role") ?? "");
      description = (form.get("description") as string | null) ?? null;

      const file = form.get("file");
      if (file && file instanceof File) {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "documentUpload");
        await fs.mkdir(uploadDir, { recursive: true });

        const safeName = file.name.replace(/\s+/g, "_");
        const filename = `${Date.now()}-${safeName}`;
        const filepath = path.join(uploadDir, filename);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filepath, buffer);

        documentPath = `/uploads/documentUpload/${filename}`;
      }
    } else {
      const body = await request.json();
      name = body.name;
      role = body.role;
      description = body.description;
      const documentName: string | null | undefined = body.documentName;
      documentPath = documentName ? `/uploads/documentUpload/${documentName}` : null;
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Name wajib diisi" },
        { status: 400 },
      );
    }

    if (!role || !role.trim()) {
      return NextResponse.json(
        { success: false, message: "Role wajib dipilih" },
        { status: 400 },
      );
    }

    // Untuk sekarang kita hanya menyimpan nama file (tanpa proses upload sebenarnya).
    await ensureTable();

    const inserted = await prisma.$queryRaw<DocumentRow[]>`
      INSERT INTO document_uploads (name, document, role, description)
      VALUES (${name.trim()}, ${documentPath}, ${role.trim()}, ${description ?? null})
      RETURNING id, name, document, role, description
    `;

    return NextResponse.json({
      success: true,
      message: "Document berhasil dibuat",
      data: inserted[0],
    });
  } catch (error: any) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat document" },
      { status: 500 },
    );
  }
}

