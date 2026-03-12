import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const taxSchema = z.object({
  name: z.string().min(1, "Nama tax wajib diisi"),
  rate: z.coerce.number().min(0, "Rate harus lebih besar atau sama dengan 0"),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const validation = taxSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: validation.error.errors[0].message,
          errors: validation.error.format() 
        },
        { status: 400 }
      );
    }

    const { name, rate } = validation.data;

    const tax = await prisma.tax.update({
      where: { id },
      data: {
        name,
        rate,
      },
    });

    return NextResponse.json({ success: true, data: tax });
  } catch (error) {
    console.error("Error updating tax:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui tax" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    await prisma.tax.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Tax berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting tax:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus tax" },
      { status: 500 }
    );
  }
}
