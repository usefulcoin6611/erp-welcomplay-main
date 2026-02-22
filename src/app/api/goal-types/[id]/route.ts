import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const goalTypeSchema = z.object({
  name: z.string().trim().min(1, "Nama goal type wajib diisi"),
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
    const validation = goalTypeSchema.safeParse(body);

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

    const goalType = await (prisma as any).goalType.update({
      where: { id },
      data: {
        name,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Goal type berhasil diperbarui",
      data: goalType,
    });
  } catch (error) {
    console.error("Error updating goal type:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui goal type" },
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

    await (prisma as any).goalType.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Goal type berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting goal type:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus goal type" },
      { status: 500 }
    );
  }
}

