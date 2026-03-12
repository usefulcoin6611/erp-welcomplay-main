import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const bugStatusSchema = z.object({
  title: z.string().trim().min(1, "Nama bug status wajib diisi"),
});

function isWriteAllowed(session: any) {
  const role = session?.user?.role;
  return role === "super admin" || role === "company";
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isWriteAllowed(session)) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = bugStatusSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message ?? "Data tidak valid";
      return NextResponse.json(
        {
          success: false,
          message: firstError,
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { title } = validation.data;

    const existing = await (prisma as any).bugStatus.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Bug status tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await (prisma as any).bugStatus.update({
      where: { id: params.id },
      data: {
        title,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bug status berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating bug status:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui bug status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isWriteAllowed(session)) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 }
      );
    }

    const existing = await (prisma as any).bugStatus.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Bug status tidak ditemukan" },
        { status: 404 }
      );
    }

    await (prisma as any).bugStatus.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Bug status berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting bug status:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus bug status" },
      { status: 500 }
    );
  }
}

