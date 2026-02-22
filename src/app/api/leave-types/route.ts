import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const leaveTypeSchema = z.object({
  name: z.string().trim().min(1, "Nama leave type wajib diisi"),
  daysPerYear: z.coerce.number().int().min(0, "Days per year minimal 0"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leaveTypes = await (prisma as any).leaveType.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: leaveTypes });
  } catch (error) {
    console.error("Error fetching leave types:", error);
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

    const { name, daysPerYear } = validation.data;

    const leaveType = await (prisma as any).leaveType.create({
      data: {
        name,
        daysPerYear,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Leave type berhasil dibuat",
      data: leaveType,
    });
  } catch (error) {
    console.error("Error creating leave type:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat leave type" },
      { status: 500 }
    );
  }
}
