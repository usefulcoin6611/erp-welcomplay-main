import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const leaveTypeSchema = z.object({
  name: z.string().trim().min(1, "Nama leave type wajib diisi"),
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
    const validation = leaveTypeSchema.safeParse(body);

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

    const leaveType = await (prisma as any).leaveType.update({
      where: { id },
      data: {
        name,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Leave type berhasil diperbarui",
      data: leaveType,
    });
  } catch (error) {
    console.error("Error updating leave type:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui leave type" },
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

    await (prisma as any).leaveType.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Leave type berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting leave type:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus leave type" },
      { status: 500 }
    );
  }
}
