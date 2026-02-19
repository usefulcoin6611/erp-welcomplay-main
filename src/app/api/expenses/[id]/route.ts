import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const expenseItemUpdateSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().nonnegative(),
  price: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  taxRate: z.number().nonnegative(),
  description: z.string().optional().nullable(),
});

type ExpenseItemUpdateInput = z.infer<typeof expenseItemUpdateSchema>;

const expenseUpdateSchema = z.object({
  type: z.string().min(1).optional(),
  party: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  total: z.number().nonnegative().optional(),
  status: z.string().optional(),
  reference: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  items: z.array(expenseItemUpdateSchema).optional(),
});

function calcExpenseItemAmountUpdate(item: ExpenseItemUpdateInput) {
  const base = Math.max(0, item.price * item.quantity - item.discount);
  const tax = (item.taxRate / 100) * base;
  return base + tax;
}

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

    const expense = await db.expense.findFirst({
      where: {
        expenseId: id,
        branchId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!expense) {
      return NextResponse.json(
        { success: false, message: "Expense tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    console.error("Error fetching expense detail:", error);
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
    const validation = expenseUpdateSchema.safeParse(body);

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

    const existing = await db.expense.findFirst({
      where: {
        expenseId: id,
        branchId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Expense tidak ditemukan" },
        { status: 404 },
      );
    }

    const itemsInput: ExpenseItemUpdateInput[] = Array.isArray(data.items)
      ? data.items
      : [];

    const updated = await db.expense.update({
      where: { id: existing.id },
      data: {
        type: data.type ?? existing.type,
        party: data.party ?? existing.party,
        date: data.date ? new Date(data.date) : existing.date,
        category: data.category ?? existing.category,
        total:
          typeof data.total === "number" ? data.total : existing.total,
        status: data.status ?? existing.status,
        reference:
          data.reference === undefined
            ? existing.reference
            : data.reference ?? null,
        description:
          data.description === undefined
            ? existing.description
            : data.description ?? null,
        items: itemsInput.length
          ? {
              deleteMany: { expenseId: existing.expenseId },
              create: itemsInput.map((it) => ({
                productId: it.productId,
                itemName: "",
                quantity: it.quantity,
                price: it.price,
                discount: it.discount,
                taxRate: it.taxRate,
                amount: calcExpenseItemAmountUpdate(it),
                description: it.description ?? null,
              })),
            }
          : undefined,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate Expense" },
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

    const existing = await db.expense.findFirst({
      where: {
        expenseId: id,
        branchId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Expense tidak ditemukan" },
        { status: 404 },
      );
    }

    await db.expense.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus Expense" },
      { status: 500 },
    );
  }
}
