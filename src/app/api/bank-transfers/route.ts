import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const transferSchema = z.object({
  date: z.string().min(1),
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1),
  amount: z.number().nonnegative(),
  reference: z.string().optional().nullable(),
  description: z.string().min(1),
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

    const transfers = await db.bankTransfer.findMany({
      where: {
        branchId,
      },
      include: {
        fromAccount: true,
        toAccount: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    const data = transfers.map((t: any) => ({
      id: t.id,
      date: t.date.toISOString().slice(0, 10),
      amount: t.amount,
      reference: t.reference ?? "",
      description: t.description ?? "",
      fromAccount: {
        id: t.fromAccount.id,
        bankName: t.fromAccount.bank,
        holderName: t.fromAccount.holderName,
      },
      toAccount: {
        id: t.toAccount.id,
        bankName: t.toAccount.bank,
        holderName: t.toAccount.holderName,
      },
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching bank transfers:", error);
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
    const validation = transferSchema.safeParse(body);

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

    if (data.fromAccountId === data.toAccountId) {
      return NextResponse.json(
        {
          success: false,
          message: "From account and to account must be different",
        },
        { status: 400 },
      );
    }

    const date = new Date(data.date);

    if (Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { success: false, message: "Format tanggal tidak valid" },
        { status: 400 },
      );
    }

    const [fromAccount, toAccount] = await Promise.all([
      db.bankAccount.findFirst({
        where: { id: data.fromAccountId, branchId },
        include: { chartAccount: true },
      }),
      db.bankAccount.findFirst({
        where: { id: data.toAccountId, branchId },
        include: { chartAccount: true },
      }),
    ]);

    if (!fromAccount || !toAccount) {
      return NextResponse.json(
        { success: false, message: "Bank account sumber atau tujuan tidak ditemukan" },
        { status: 400 },
      );
    }

    if (
      fromAccount.chartAccount.type !== "Assets" ||
      toAccount.chartAccount.type !== "Assets"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Hanya akun bank (Assets) yang dapat digunakan untuk Bank Transfer",
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const transfer = await tx.bankTransfer.create({
        data: {
          branchId,
          fromAccountId: data.fromAccountId,
          toAccountId: data.toAccountId,
          date,
          amount: data.amount,
          reference: data.reference ?? undefined,
          description: data.description,
        },
        include: {
          fromAccount: true,
          toAccount: true,
        },
      });

      const year = date.getFullYear();
      const journalId = `BT-${year}-${Math.floor(Math.random() * 100000)
        .toString()
        .padStart(3, "0")}`;

      const journal = await tx.journalEntry.create({
        data: {
          journalId,
          date,
          description: data.description || null,
          reference: data.reference || transfer.id,
          amount: data.amount,
          branchId,
          bankAccount: { connect: { id: data.fromAccountId } },
        },
      });

      await tx.journalLine.create({
        data: {
          journalEntryId: journal.id,
          accountId: toAccount.chartAccountId,
          debit: data.amount,
          credit: 0,
          description: data.description || null,
        },
      });

      await tx.journalLine.create({
        data: {
          journalEntryId: journal.id,
          accountId: fromAccount.chartAccountId,
          debit: 0,
          credit: data.amount,
          description: data.description || null,
        },
      });

      return transfer;
    });

    const payload = {
      id: result.id,
      date: result.date.toISOString().slice(0, 10),
      amount: result.amount,
      reference: result.reference ?? "",
      description: result.description ?? "",
      fromAccount: {
        id: result.fromAccount.id,
        bankName: result.fromAccount.bank,
        holderName: result.fromAccount.holderName,
      },
      toAccount: {
        id: result.toAccount.id,
        bankName: result.toAccount.bank,
        holderName: result.toAccount.holderName,
      },
    };

    return NextResponse.json({ success: true, data: payload });
  } catch (error) {
    console.error("Error creating bank transfer:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat Bank Transfer" },
      { status: 500 },
    );
  }
}
