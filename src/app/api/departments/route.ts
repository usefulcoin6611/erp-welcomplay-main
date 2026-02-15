import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const departments = await prisma.department.findMany({
      include: {
        branch: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super admin or company can create master data
    const userRole = (session.user as any).role;
    if (userRole !== "super admin" && userRole !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 }
      );
    }

    const { name, branchId } = await request.json();

    if (!name || !branchId) {
      return NextResponse.json(
        { success: false, message: "Nama dan Branch harus diisi" },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
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
    console.error("Error creating department:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat department" },
      { status: 500 }
    );
  }
}
