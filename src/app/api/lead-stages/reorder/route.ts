import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).nonempty(),
});

function isWriteAllowed(session: any) {
  const role = session?.user?.role;
  return role === "super admin" || role === "company";
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
    const validation = reorderSchema.safeParse(body);

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

    const { ids } = validation.data;

    // Transaction to ensure atomicity
    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.leadStage.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Urutan lead stage berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error reordering lead stages:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui urutan lead stage" },
      { status: 500 }
    );
  }
}
