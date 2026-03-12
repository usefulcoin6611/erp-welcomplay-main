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

    let branch: string | undefined;
    let title: string | undefined;
    let description: string | undefined;
    let attachmentPath: string | null | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      branch = String(form.get("branch") ?? "");
      title = String(form.get("title") ?? "");
      description = (form.get("description") as string | null) ?? null;
      const removedFlag = form.get("attachmentRemoved");
      const attachmentRemoved = removedFlag === "true";

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
      } else if (attachmentRemoved) {
        attachmentPath = null;
      }
    } else {
      const body = await request.json();
      branch = body.branch;
      title = body.title;
      description = body.description;
      const attachmentName: string | null | undefined = body.attachmentName;
      attachmentPath = attachmentName ? `/uploads/companyPolicy/${attachmentName}` : undefined;
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

    const updated =
      attachmentPath === undefined
        ? await prisma.$queryRaw<PolicyRow[]>`
            UPDATE company_policies
            SET
              branch = ${branch.trim()},
              title = ${title.trim()},
              description = ${description ?? null},
              updated_at = NOW()
            WHERE id = ${numericId}
            RETURNING id, branch, title, description, attachment
          `
        : await prisma.$queryRaw<PolicyRow[]>`
            UPDATE company_policies
            SET
              branch = ${branch.trim()},
              title = ${title.trim()},
              description = ${description ?? null},
              attachment = ${attachmentPath},
              updated_at = NOW()
            WHERE id = ${numericId}
            RETURNING id, branch, title, description, attachment
          `;

    if (!updated.length) {
      return NextResponse.json(
        { success: false, message: "Company policy tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Company policy berhasil diperbarui",
      data: updated[0],
    });
  } catch (error: any) {
    console.error("Error updating company policy:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui company policy" },
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

    const deleted = await prisma.$queryRaw<PolicyRow[]>`
      DELETE FROM company_policies
      WHERE id = ${numericId}
      RETURNING id, branch, title, description, attachment
    `;

    if (!deleted.length) {
      return NextResponse.json(
        { success: false, message: "Company policy tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Company policy berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Error deleting company policy:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus company policy" },
      { status: 500 },
    );
  }
}

