import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const designationSchema = z.object({
  name: z.string().trim().min(1, "Nama designation wajib diisi"),
  departmentId: z.string().min(1, "Department wajib dipilih"),
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
    const validation = designationSchema.safeParse(body);

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

    const { name, departmentId } = validation.data;

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true },
    });

    if (!department) {
      return NextResponse.json(
        { success: false, message: "Department tidak ditemukan" },
        { status: 400 }
      );
    }

    const designation = await prisma.designation.update({
      where: { id },
      data: {
        name,
        departmentId,
      },
      include: {
        department: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Designation berhasil diperbarui",
      data: designation,
    });
  } catch (error) {
    console.error("Error updating designation:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui designation" },
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

    await prisma.designation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Designation berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting designation:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus designation" },
      { status: 500 }
    );
  }
}
