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

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const journals = await prisma.journalEntry.findMany({
      where: {
        branch: {
          ownerId: companyId,
        },
      },
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ success: true, data: journals });
  } catch (error) {
    console.error("Error fetching journals:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
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

    const branchId = (session.user as any).branchId;
    if (!branchId) {
      return NextResponse.json({ error: "User has no assigned branch" }, { status: 400 });
    }

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

    // Validate debit and credit balance
    const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { success: false, message: "Total Debit dan Credit harus seimbang" },
        { status: 400 }
      );
    }

    if (Math.abs(totalDebit - amount) > 0.01) {
      return NextResponse.json(
        { success: false, message: "Total amount harus sama dengan total debit" },
        { status: 400 }
      );
    }

    // Check if journalId already exists in the same branch
    const existingJournal = await prisma.journalEntry.findFirst({
      where: { journalId, branchId },
    });

    if (existingJournal) {
      return NextResponse.json(
        { success: false, message: `Journal ID ${journalId} sudah ada` },
        { status: 400 }
      );
    }

    const journal = await prisma.journalEntry.create({
      data: {
        journalId,
        date: new Date(date),
        description,
        reference,
        amount,
        branchId,
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

    return NextResponse.json({ success: true, data: journal });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat Journal Entry" },
      { status: 500 }
    );
  }
}
