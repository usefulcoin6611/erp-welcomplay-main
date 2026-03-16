import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const jobStageSchema = z.object({
  name: z.string().trim().min(1, "Nama job stage wajib diisi"),
});

function isWriteAllowed(session: any) {
  const role = session?.user?.role;
  return role === "super admin" || role === "company";
}

import { getTenantFilter, getTenantId } from "@/lib/multi-tenancy";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantFilter = await getTenantFilter(session.user);

    const stages = await (prisma as any).jobStage.findMany({
      where: tenantFilter,
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: stages,
    });
  } catch (error) {
    console.error("Error fetching job stages:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data job stage" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isWriteAllowed(session)) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = jobStageSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message ?? "Data tidak valid";
      return NextResponse.json(
        {
          success: false,
          message: firstError,
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { name } = validation.data;
    const ownerId = getTenantId(session.user);

    const lastStage = await (prisma as any).jobStage.findFirst({
      where: { ownerId },
      orderBy: { order: "desc" },
    });

    const nextOrder = lastStage ? (lastStage.order ?? 0) + 1 : 1;

    const stage = await (prisma as any).jobStage.create({
      data: {
        name,
        order: nextOrder,
        ownerId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Job stage berhasil dibuat",
      data: stage,
    });
  } catch (error) {
    console.error("Error creating job stage:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat job stage" },
      { status: 500 }
    );
  }
}
