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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json(
        { success: false, message: "ID tidak valid" },
        { status: 400 },
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let name: string | undefined;
    let role: string | undefined;
    let description: string | undefined;
    let documentPath: string | null | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      name = String(form.get("name") ?? "");
      role = String(form.get("role") ?? "");
      description = (form.get("description") as string | null) ?? null;
      const removedFlag = form.get("documentRemoved");
      const documentRemoved = removedFlag === "true";

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
      } else if (documentRemoved) {
        documentPath = null;
      }
    } else {
      const body = await request.json();
      name = body.name;
      role = body.role;
      description = body.description;
      const documentName: string | null | undefined = body.documentName;
      documentPath = documentName ? `/uploads/documentUpload/${documentName}` : undefined;
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

    const updated =
      documentPath === undefined
        ? await prisma.$queryRaw<DocumentRow[]>`
            UPDATE document_uploads
            SET
              name = ${name.trim()},
              role = ${role.trim()},
              description = ${description ?? null},
              updated_at = NOW()
            WHERE id = ${numericId}
            RETURNING id, name, document, role, description
          `
        : await prisma.$queryRaw<DocumentRow[]>`
            UPDATE document_uploads
            SET
              name = ${name.trim()},
              role = ${role.trim()},
              description = ${description ?? null},
              document = ${documentPath},
              updated_at = NOW()
            WHERE id = ${numericId}
            RETURNING id, name, document, role, description
          `;

    if (!updated.length) {
      return NextResponse.json(
        { success: false, message: "Document tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Document berhasil diperbarui",
      data: updated[0],
    });
  } catch (error: any) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui document" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json(
        { success: false, message: "ID tidak valid" },
        { status: 400 },
      );
    }

    const deleted = await prisma.$queryRaw<DocumentRow[]>`
      DELETE FROM document_uploads
      WHERE id = ${numericId}
      RETURNING id, name, document, role, description
    `;

    if (!deleted.length) {
      return NextResponse.json(
        { success: false, message: "Document tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Document berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus document" },
      { status: 500 },
    );
  }
}

