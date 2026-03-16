import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const awardTypeSchema = z.object({
  name: z.string().trim().min(1, "Nama award type wajib diisi"),
});

import { getTenantFilter, getTenantId } from "@/lib/multi-tenancy";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantFilter = await getTenantFilter(session.user);

    const awardTypes = await (prisma as any).awardType.findMany({
      where: tenantFilter,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: awardTypes });
  } catch (error) {
    console.error("Error fetching award types:", error);
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
    const validation = awardTypeSchema.safeParse(body);

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
    const ownerId = getTenantId(session.user);

    const awardType = await (prisma as any).awardType.create({
      data: {
        name,
        ownerId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Award type berhasil dibuat",
      data: awardType,
    });
  } catch (error) {
    console.error("Error creating award type:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat award type" },
      { status: 500 }
    );
  }
}

