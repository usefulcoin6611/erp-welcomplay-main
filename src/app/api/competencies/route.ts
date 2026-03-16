import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const competencySchema = z.object({
  name: z.string().trim().min(1, "Nama competency wajib diisi"),
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

    const competencies = await (prisma as any).competency.findMany({
      where: tenantFilter,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: competencies });
  } catch (error) {
    console.error("Error fetching competencies:", error);
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
    const validation = competencySchema.safeParse(body);

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

    const competency = await (prisma as any).competency.create({
      data: {
        name,
        ownerId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Competency berhasil dibuat",
      data: competency,
    });
  } catch (error) {
    console.error("Error creating competency:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat competency" },
      { status: 500 }
    );
  }
}

