import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const journalLineSchema = z.object({
  accountId: z.string().min(1, "Akun wajib diisi"),
  debit: z.number().nonnegative().default(0),
  credit: z.number().nonnegative().default(0),
  description: z.string().optional().nullable(),
});

const journalEntrySchema = z.object({
  journalId: z.string().min(1, "Journal ID wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
  description: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  amount: z.number().nonnegative(),
  lines: z.array(journalLineSchema).min(2, "Minimal harus ada 2 baris jurnal"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const journal = await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!journal) {
      return NextResponse.json(
        { success: false, message: "Journal Entry tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: journal });
  } catch (error) {
    console.error("Error fetching journal:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validation = journalEntrySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0].message,
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { journalId, date, description, reference, amount, lines } = validation.data;

    // Validate balance
    const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { success: false, message: "Total Debit dan Credit harus seimbang" },
        { status: 400 }
      );
    }

    // Check if journalId already exists for other entries
    const existingJournal = await prisma.journalEntry.findFirst({
      where: {
        journalId,
        id: { not: id },
      },
    });

    if (existingJournal) {
      return NextResponse.json(
        { success: false, message: "Journal ID sudah digunakan" },
        { status: 400 }
      );
    }

    // Update using transaction to replace all lines
    const journal = await prisma.$transaction(async (tx) => {
      // Delete old lines
      await tx.journalLine.deleteMany({
        where: { journalEntryId: id },
      });

      // Update entry and create new lines
      return await tx.journalEntry.update({
        where: { id },
        data: {
          journalId,
          date: new Date(date),
          description,
          reference,
          amount,
          lines: {
            create: lines.map((line) => ({
              accountId: line.accountId,
              debit: line.debit,
              credit: line.credit,
              description: line.description,
            })),
          },
        },
        include: {
          lines: true,
        },
      });
    });

    return NextResponse.json({ success: true, data: journal });
  } catch (error) {
    console.error("Error updating journal entry:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui Journal Entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.journalEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Journal Entry berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus Journal Entry" },
      { status: 500 }
    );
  }
}
