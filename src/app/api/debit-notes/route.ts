import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const debitNoteSchema = z.object({
  billId: z.string().min(1, "Bill wajib dipilih"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  amount: z.number().positive("Jumlah harus lebih dari 0"),
  description: z.string().optional(),
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

    const debitNotes = await db.debitNote.findMany({
      where: {
        bill: {
          branchId,
        },
      },
      include: {
        bill: {
          include: {
            vendor: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ success: true, data: debitNotes });
  } catch (error) {
    console.error("Error fetching debit notes:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
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

    const branchId = (session.user as any).branchId as string | null;

    if (!branchId) {
      return NextResponse.json(
        { error: "User has no assigned branch" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validation = debitNoteSchema.safeParse(body);

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

    // Check if bill exists and belongs to user's branch
    const bill = await db.bill.findFirst({
      where: {
        billId: data.billId,
        branchId,
      },
    });

    if (!bill) {
      return NextResponse.json(
        { success: false, message: "Bill tidak ditemukan" },
        { status: 404 },
      );
    }

    // Get latest number for auto-increment
    const lastNote = await db.debitNote.findFirst({
      orderBy: {
        number: "desc",
      },
    });
    const nextNumber = (lastNote?.number ?? 0) + 1;

    const newNote = await db.debitNote.create({
      data: {
        number: nextNumber,
        billId: data.billId,
        date: new Date(data.date),
        amount: data.amount,
        description: data.description,
        status: 0, // Pending
      },
      include: {
        bill: {
          include: {
            vendor: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: newNote });
  } catch (error) {
    console.error("Error creating debit note:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat Debit Note" },
      { status: 500 },
    );
  }
}
