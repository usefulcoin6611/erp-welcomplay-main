import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const deductionOptionSchema = z.object({
  name: z.string().trim().min(1, "Nama deduction option wajib diisi"),
  description: z.string().trim().optional(),
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
    const validation = deductionOptionSchema.safeParse(body);

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

    const { name, description } = validation.data;

    const deductionOption = await (prisma as any).deductionOption.update({
      where: { id },
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Deduction option berhasil diperbarui",
      data: deductionOption,
    });
  } catch (error) {
    console.error("Error updating deduction option:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui deduction option" },
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

    await (prisma as any).deductionOption.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Deduction option berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting deduction option:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus deduction option" },
      { status: 500 }
    );
  }
}

