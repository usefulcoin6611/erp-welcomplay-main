import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateTrainerSchema = z.object({
  branch: z.string().trim().min(1).optional(),
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
  contact: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  expertise: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = await prisma.trainer.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Trainer tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("Error fetching trainer:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat trainer" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "super admin" && role !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const existing = await prisma.trainer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Trainer tidak ditemukan" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateTrainerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.errors[0]?.message ?? "Data tidak valid",
          errors: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const data: Record<string, unknown> = { ...parsed.data };
    const updated = await prisma.trainer.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Trainer berhasil diperbarui",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating trainer:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Email trainer sudah digunakan" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui trainer" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "super admin" && role !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;
    await prisma.trainer.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Trainer berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting trainer:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus trainer" },
      { status: 500 },
    );
  }
}

