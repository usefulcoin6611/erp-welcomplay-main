import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const paymentUpdateSchema = z.object({
  date: z.string().min(1).optional(),
  vendor: z.string().min(1).optional(),
  account: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  amount: z.number().nonnegative().optional(),
  status: z.string().optional(),
  reference: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

const db = prisma as any;

export async function GET(
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

    const payment = await db.payment.findFirst({
      where: {
        paymentId: id,
        branchId,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    console.error("Error fetching payment detail:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}

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
    const validation = paymentUpdateSchema.safeParse(body);

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

    const existing = await db.payment.findFirst({
      where: {
        paymentId: id,
        branchId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Payment tidak ditemukan" },
        { status: 404 },
      );
    }

    const updated = await db.payment.update({
      where: { id: existing.id },
      data: {
        date: data.date ? new Date(data.date) : existing.date,
        vendor: data.vendor ?? existing.vendor,
        account: data.account ?? existing.account,
        category: data.category ?? existing.category,
        amount:
          typeof data.amount === "number" ? data.amount : existing.amount,
        status: data.status ?? existing.status,
        reference:
          data.reference === undefined
            ? existing.reference
            : data.reference ?? null,
        description:
          data.description === undefined
            ? existing.description
            : data.description ?? null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate Payment" },
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

    const existing = await db.payment.findFirst({
      where: {
        paymentId: id,
        branchId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Payment tidak ditemukan" },
        { status: 404 },
      );
    }

    await db.payment.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus Payment" },
      { status: 500 },
    );
  }
}
