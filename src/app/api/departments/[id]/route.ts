import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

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

    const { name, branchId } = await request.json();

    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
        branchId,
      },
      include: {
        branch: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: department });
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui department" },
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

    // Check if department has designations or users before deleting
    const designationCount = await prisma.designation.count({
      where: { departmentId: id },
    });

    const userCount = await prisma.user.count({
      where: { departmentId: id },
    });

    if (designationCount > 0 || userCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Gagal menghapus: Department masih memiliki designation atau user yang terikat",
        },
        { status: 400 }
      );
    }

    await prisma.department.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Department berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus department" },
      { status: 500 }
    );
  }
}
