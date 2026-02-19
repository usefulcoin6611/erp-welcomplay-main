import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = (session.user as any).branchId || null;

    const bankAccounts = await prisma.bankAccount.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        chartAccount: {
          select: { code: true, name: true, balance: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = bankAccounts.map((b: (typeof bankAccounts)[number]) => ({
      id: b.id,
      chartOfAccount: `${b.chartAccount.code} - ${b.chartAccount.name}`,
      name: b.holderName,
      bank: b.bank,
      accountNumber: b.accountNumber,
      currentBalance: `Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(b.chartAccount.balance ?? b.openingBalance ?? 0)}`,
      contactNumber: b.contactNumber || "",
      paymentGateway: b.paymentGateway,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
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

    const branchId = (session.user as any).branchId || null;
    const body = await request.json();

    const chartCode = String(body.chartCode ?? "");
    const chart = await prisma.chartOfAccount.findUnique({ where: { code: chartCode } });
    if (!chart) {
      return NextResponse.json({ success: false, message: "Chart of Account tidak ditemukan" }, { status: 400 });
    }

    const created = await prisma.bankAccount.create({
      data: {
        chartAccountId: chart.id,
        holderName: String(body.holderName ?? ""),
        bank: String(body.bank ?? ""),
        accountNumber: String(body.accountNumber ?? ""),
        openingBalance: Number(body.openingBalance ?? 0),
        contactNumber: body.contactNumber ? String(body.contactNumber) : null,
        bankAddress: body.bankAddress ? String(body.bankAddress) : null,
        paymentGateway: String(body.paymentGateway ?? "none"),
        branchId,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
