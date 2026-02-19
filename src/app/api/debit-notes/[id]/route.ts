import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const debitNoteUpdateSchema = z.object({
  date: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  status: z.number().int().min(0).max(2).optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

const db = prisma as any;

export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = (session.user as any).branchId as string | null;

    if (!branchId) {
      return NextResponse.json(
        { error: "User has no assigned branch" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validation = debitNoteUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0].message,
          errors: validation.error.format(),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    // Verify existence and ownership
    const existing = await db.debitNote.findFirst({
      where: {
        id,
        bill: {
          branchId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Debit Note tidak ditemukan" },
        { status: 404 },
      );
    }

    const updated = await db.debitNote.update({
      where: { id },
      data: {
        date: data.date ? new Date(data.date) : undefined,
        amount: data.amount,
        description: data.description,
        status: data.status,
      },
      include: {
        bill: {
          include: {
            vendor: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating debit note:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate Debit Note" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = (session.user as any).branchId as string | null;

    if (!branchId) {
      return NextResponse.json(
        { error: "User has no assigned branch" },
        { status: 400 },
      );
    }

    const existing = await db.debitNote.findFirst({
      where: {
        id,
        bill: {
          branchId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Debit Note tidak ditemukan" },
        { status: 404 },
      );
    }

    await db.debitNote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting debit note:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus Debit Note" },
      { status: 500 },
    );
  }
}
