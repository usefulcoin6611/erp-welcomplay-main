import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const designationSchema = z.object({
  name: z.string().trim().min(1, "Nama designation wajib diisi"),
  departmentId: z.string().min(1, "Department wajib dipilih"),
});

import { getTenantFilter } from "@/lib/multi-tenancy";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantFilter = await getTenantFilter(session.user);
    const where: any = {};
    if (tenantFilter?.ownerId) {
      where.department = {
        branch: {
          ownerId: tenantFilter.ownerId
        }
      };
    }

    const designations = await prisma.designation.findMany({
      where,
      include: {
        department: {
          select: {
            name: true,
            branch: {
              select: {
                id: true,
                name: true,
              },
            },
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

    return NextResponse.json({
      success: true,
      message: "Designation berhasil dibuat",
      data: designation,
    });
  } catch (error) {
    console.error("Error creating designation:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat designation" },
      { status: 500 }
    );
  }
}
