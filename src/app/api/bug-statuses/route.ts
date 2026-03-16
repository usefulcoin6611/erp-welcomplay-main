import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const bugStatusSchema = z.object({
  title: z.string().trim().min(1, "Nama bug status wajib diisi"),
});

function isWriteAllowed(session: any) {
  const role = session?.user?.role;
  return role === "super admin" || role === "company";
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const branchId = (session.user as any).branchId as string | null;
    if (!branchId) return NextResponse.json({ success: true, data: [] });

    const statuses = await (prisma as any).bugStatus.findMany({
      where: { branchId },
      orderBy: [
        { order: "asc" },
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    console.error("Error fetching bug statuses:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data bug status" },
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
    const validation = bugStatusSchema.safeParse(body);

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

    const { title } = validation.data;

    const branchId = (session.user as any).branchId as string | null;
    if (!branchId) return NextResponse.json({ success: false, message: "Branch ID tidak ditemukan" }, { status: 400 });

    const lastStatus = await (prisma as any).bugStatus.findFirst({
      where: { branchId },
      orderBy: { order: "desc" },
    });

    const nextOrder = lastStatus ? (lastStatus.order ?? 0) + 1 : 1;

    const status = await (prisma as any).bugStatus.create({
      data: {
        title,
        order: nextOrder,
        branchId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bug status berhasil dibuat",
      data: status,
    });
  } catch (error) {
    console.error("Error creating bug status:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat bug status" },
      { status: 500 }
    );
  }
}

