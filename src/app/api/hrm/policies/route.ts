import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { promises as fs } from "fs";
import path from "path";

type PolicyRow = {
  id: number;
  branch: string;
  title: string;
  description: string | null;
  attachment: string | null;
};

async function ensureTable() {
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
  // Ensure ownerId column exists
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE company_policies ADD COLUMN IF NOT EXISTS "ownerId" TEXT;
    `);
  } catch (e) {
    // Ignore if column already exists or other errors
  }
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

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const rows = await prisma.$queryRaw<PolicyRow[]>`
      SELECT id, branch, title, description, attachment
      FROM company_policies
      WHERE "ownerId" = ${companyId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error("Error fetching policies:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat company policy" },
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

    let branch: string | undefined;
    let title: string | undefined;
    let description: string | null | undefined;
    let attachmentPath: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      branch = String(form.get("branch") ?? "");
      title = String(form.get("title") ?? "");
      description = (form.get("description") as string | null) ?? null;

      const file = form.get("attachment");
      if (file && file instanceof File) {
        const uploadDir = path.join(process.cwd(), "public", "uploads", "companyPolicy");
        await fs.mkdir(uploadDir, { recursive: true });

        const safeName = file.name.replace(/\s+/g, "_");
        const filename = `${Date.now()}-${safeName}`;
        const filepath = path.join(uploadDir, filename);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filepath, buffer);

        attachmentPath = `/uploads/companyPolicy/${filename}`;
      }
    } else {
      const body = await request.json();
      branch = body.branch;
      title = body.title;
      description = body.description;
      const attachmentName: string | null | undefined = body.attachmentName;
      attachmentPath = attachmentName ? `/uploads/companyPolicy/${attachmentName}` : null;
    }

    if (!branch || !branch.trim()) {
      return NextResponse.json(
        { success: false, message: "Branch wajib dipilih" },
        { status: 400 },
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "Title wajib diisi" },
        { status: 400 },
      );
    }

    const { id: userId, ownerId: sessionOwnerId } = session.user as any;
    const companyId = userRole === "company" ? userId : sessionOwnerId;

    await ensureTable();

    const inserted = await prisma.$queryRaw<PolicyRow[]>`
      INSERT INTO company_policies (branch, title, description, attachment, "ownerId")
      VALUES (${branch.trim()}, ${title.trim()}, ${description ?? null}, ${attachmentPath}, ${companyId})
      RETURNING id, branch, title, description, attachment
    `;

    return NextResponse.json({
      success: true,
      message: "Company policy berhasil dibuat",
      data: inserted[0],
    });
  } catch (error: any) {
    console.error("Error creating policy:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat company policy" },
      { status: 500 },
    );
  }
}

