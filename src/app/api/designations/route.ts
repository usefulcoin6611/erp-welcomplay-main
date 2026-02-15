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

    const designations = await prisma.designation.findMany({
      include: {
        department: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: designations });
  } catch (error) {
    console.error("Error fetching designations:", error);
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

    const userRole = (session.user as any).role;
    if (userRole !== "super admin" && userRole !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 }
      );
    }

    const { name, departmentId } = await request.json();

    if (!name || !departmentId) {
      return NextResponse.json(
        { success: false, message: "Nama dan Department harus diisi" },
        { status: 400 }
      );
    }

    const designation = await prisma.designation.create({
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

    return NextResponse.json({ success: true, data: designation });
  } catch (error) {
    console.error("Error creating designation:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat designation" },
      { status: 500 }
    );
  }
}
