import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const projectTaskStageSchema = z.object({
  name: z.string().trim().min(1, "Nama project task stage wajib diisi"),
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
    const validation = projectTaskStageSchema.safeParse(body);

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

    const { name } = validation.data;

    const existing = await (prisma as any).projectTaskStage.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Project task stage tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await (prisma as any).projectTaskStage.update({
      where: { id: params.id },
      data: {
        name,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Project task stage berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating project task stage:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui project task stage" },
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

    const existing = await (prisma as any).projectTaskStage.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Project task stage tidak ditemukan" },
        { status: 404 }
      );
    }

    await (prisma as any).projectTaskStage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Project task stage berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting project task stage:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus project task stage" },
      { status: 500 }
    );
  }
}

