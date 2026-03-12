import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = (session.user as any).branchId || null;
    const body = await request.json().catch(() => ({} as any));

    const existing = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Bank account tidak ditemukan" },
        { status: 404 }
      );
    }

    if (branchId && existing.branchId && existing.branchId !== branchId) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses ke akun bank ini" },
        { status: 403 }
      );
    }

    const data: any = {};

    if (typeof body.chartCode === "string" && body.chartCode.trim() !== "") {
      const chartCode = String(body.chartCode);
      const chart = await prisma.chartOfAccount.findUnique({
        where: { code: chartCode },
      });

      if (!chart) {
        return NextResponse.json(
          { success: false, message: "Chart of Account tidak ditemukan" },
          { status: 400 }
        );
      }

      data.chartAccountId = chart.id;
    }

    if (typeof body.holderName === "string") {
      data.holderName = body.holderName;
    }
    if (typeof body.bank === "string") {
      data.bank = body.bank;
    }
    if (typeof body.accountNumber === "string") {
      data.accountNumber = body.accountNumber;
    }
    if (body.openingBalance !== undefined) {
      const openingBalance = Number(body.openingBalance);
      if (!Number.isNaN(openingBalance)) {
        data.openingBalance = openingBalance;
      }
    }
    if (body.contactNumber !== undefined) {
      data.contactNumber =
        body.contactNumber === null ? null : String(body.contactNumber);
    }
    if (body.bankAddress !== undefined) {
      data.bankAddress =
        body.bankAddress === null ? null : String(body.bankAddress);
    }
    if (typeof body.paymentGateway === "string") {
      data.paymentGateway = body.paymentGateway;
    }

    const updated = await prisma.bankAccount.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = (session.user as any).branchId || null;

    const existing = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Bank account tidak ditemukan" },
        { status: 404 }
      );
    }

    if (branchId && existing.branchId && existing.branchId !== branchId) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses ke akun bank ini" },
        { status: 403 }
      );
    }

    await prisma.bankAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

