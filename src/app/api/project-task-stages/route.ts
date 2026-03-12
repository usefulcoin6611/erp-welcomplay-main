import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const projectTaskStageSchema = z.object({
  name: z.string().trim().min(1, "Nama project task stage wajib diisi"),
});

function isWriteAllowed(session: any) {
  const role = session?.user?.role;
  return role === "super admin" || role === "company";
}

export async function GET() {
  try {
    const stages = await (prisma as any).projectTaskStage.findMany({
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
    console.error("Error fetching project task stages:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data project task stage" },
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
    const validation = projectTaskStageSchema.safeParse(body);

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

    const lastStage = await (prisma as any).projectTaskStage.findFirst({
      orderBy: { order: "desc" },
    });

    const nextOrder = lastStage ? (lastStage.order ?? 0) + 1 : 1;

    const stage = await (prisma as any).projectTaskStage.create({
      data: {
        name,
        order: nextOrder,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Project task stage berhasil dibuat",
      data: stage,
    });
  } catch (error) {
    console.error("Error creating project task stage:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat project task stage" },
      { status: 500 }
    );
  }
}

