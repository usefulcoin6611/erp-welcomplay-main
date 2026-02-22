import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const trainingTypeSchema = z.object({
  name: z.string().trim().min(1, "Nama training type wajib diisi"),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = trainingTypeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0]?.message ?? "Data tidak valid",
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    const trainingType = await (prisma as any).trainingType.update({
      where: { id },
      data: {
        name,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Training type berhasil diperbarui",
      data: trainingType,
    });
  } catch (error) {
    console.error("Error updating training type:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui training type" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        { status: 403 }
      );
    }

    await (prisma as any).trainingType.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Training type berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting training type:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus training type" },
      { status: 500 }
    );
  }
}

