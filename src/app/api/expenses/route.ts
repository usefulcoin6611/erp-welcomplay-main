import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const expenseSchema = z.object({
  type: z.string().min(1, "Tipe wajib diisi"),
  party: z.string().min(1, "Pihak wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  category: z.string().min(1, "Kategori wajib diisi"),
  total: z.number().nonnegative(),
  status: z.string().optional().default("Pending"),
  reference: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const db = prisma as any;

export async function GET(request: NextRequest) {
  try {
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

    const expenses = await db.expense.findMany({
      where: {
        branchId,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}

async function generateExpenseId(branchId: string, date: Date) {
  const year = date.getFullYear();

  const lastExpense = await db.expense.findFirst({
    where: {
      branchId,
      expenseId: {
        startsWith: `EXP-${year}-`,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let nextNumber = 1;

  if (lastExpense?.expenseId) {
    const match = lastExpense.expenseId.match(/EXP-\d{4}-(\d{3,})$/);
    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  const sequence = String(nextNumber).padStart(3, "0");
  return `EXP-${year}-${sequence}`;
}

export async function POST(request: NextRequest) {
  try {
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
    const validation = expenseSchema.safeParse(body);

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
    const date = new Date(data.date);

    const expenseId = await generateExpenseId(branchId, date);

    const expense = await db.expense.create({
      data: {
        expenseId,
        type: data.type,
        party: data.party,
        date,
        category: data.category,
        total: data.total,
        status: data.status ?? "Pending",
        reference: data.reference ?? undefined,
        description: data.description ?? undefined,
        branchId,
      },
    });

    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat Expense" },
      { status: 500 },
    );
  }
}
