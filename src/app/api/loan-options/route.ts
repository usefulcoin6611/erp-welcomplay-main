import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const loanOptionSchema = z.object({
  name: z.string().trim().min(1, "Nama loan option wajib diisi"),
  description: z.string().trim().optional(),
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

    const loanOptions = await (prisma as any).loanOption.findMany({
      where: tenantFilter,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: loanOptions });
  } catch (error) {
    console.error("Error fetching loan options:", error);
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
    const validation = loanOptionSchema.safeParse(body);

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
    const ownerId = getTenantId(session.user);

    const loanOption = await (prisma as any).loanOption.create({
      data: {
        name,
        description: description || null,
        ownerId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Loan option berhasil dibuat",
      data: loanOption,
    });
  } catch (error) {
    console.error("Error creating loan option:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat loan option" },
      { status: 500 }
    );
  }
}

