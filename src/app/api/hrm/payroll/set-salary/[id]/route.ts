import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

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

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        allowances: true,
        commissions: true,
        loans: true,
        saturationDeductions: true,
        otherPayments: true,
        overtimes: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error: any) {
    console.error("Error fetching employee salary details:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
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
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (body.basicSalary == null || body.salaryType == null) {
      return NextResponse.json(
        { success: false, message: "basicSalary dan salaryType wajib diisi" },
        { status: 400 }
      );
    }

    const allowances = Array.isArray(body.allowances) ? body.allowances : [];
    const commissions = Array.isArray(body.commissions) ? body.commissions : [];
    const loans = Array.isArray(body.loans) ? body.loans : [];
    const saturationDeductions = Array.isArray(body.saturationDeductions) ? body.saturationDeductions : [];
    const otherPayments = Array.isArray(body.otherPayments) ? body.otherPayments : [];
    const overtimes = Array.isArray(body.overtimes) ? body.overtimes : [];

    await prisma.$transaction(async (tx) => {
      // Update Basic Info + optional bank account mapping
      const employeeUpdateData: any = {
        basicSalary: Number(body.basicSalary),
        salaryType: body.salaryType,
      };

      if (body.bankAccountId) {
        const bank = await tx.bankAccount.findUnique({
          where: { id: String(body.bankAccountId) },
          include: { chartAccount: true },
        });
        if (bank) {
          employeeUpdateData.accountNumber = bank.accountNumber;
          employeeUpdateData.bankName = bank.bank;
          employeeUpdateData.bankIdentifierCode = bank.chartAccount?.code ?? null;
        }
      }

      await tx.employee.update({
        where: { id },
        data: employeeUpdateData,
      });

      // Update Allowances
      await tx.employeeAllowance.deleteMany({ where: { employeeId: id } });
      if (allowances.length > 0) {
        await tx.employeeAllowance.createMany({
          data: allowances.map((item: any) => ({
            employeeId: id,
            allowanceOptionId: String(item.allowanceOptionId ?? ""),
            title: String(item.title ?? ""),
            amount: Number(item.amount ?? 0),
            type: String(item.type ?? "Fixed"),
          })),
        });
      }

      // Update Commissions
      await tx.employeeCommission.deleteMany({ where: { employeeId: id } });
      if (commissions.length > 0) {
        await tx.employeeCommission.createMany({
          data: commissions.map((item: any) => ({
            employeeId: id,
            title: String(item.title ?? ""),
            amount: Number(item.amount ?? 0),
            type: String(item.type ?? "Fixed"),
          })),
        });
      }

      // Update Loans
      await tx.employeeLoan.deleteMany({ where: { employeeId: id } });
      if (loans.length > 0) {
        await tx.employeeLoan.createMany({
          data: loans.map((item: any) => ({
            employeeId: id,
            loanOptionId: String(item.loanOptionId ?? ""),
            title: String(item.title ?? ""),
            amount: Number(item.amount ?? 0),
            startDate: item.startDate ? new Date(item.startDate) : new Date(),
            endDate: item.endDate ? new Date(item.endDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            reason: item.reason != null ? String(item.reason) : null,
          })),
        });
      }

      // Update Saturation Deductions
      await tx.employeeSaturationDeduction.deleteMany({ where: { employeeId: id } });
      if (saturationDeductions.length > 0) {
        await tx.employeeSaturationDeduction.createMany({
          data: saturationDeductions.map((item: any) => ({
            employeeId: id,
            deductionOptionId: String(item.deductionOptionId ?? ""),
            title: String(item.title ?? ""),
            amount: Number(item.amount ?? 0),
            type: String(item.type ?? "Fixed"),
          })),
        });
      }

      // Update Other Payments
      await tx.employeeOtherPayment.deleteMany({ where: { employeeId: id } });
      if (otherPayments.length > 0) {
        await tx.employeeOtherPayment.createMany({
          data: otherPayments.map((item: any) => ({
            employeeId: id,
            title: String(item.title ?? ""),
            amount: Number(item.amount ?? 0),
            type: String(item.type ?? "Fixed"),
          })),
        });
      }

      // Update Overtimes
      await tx.employeeOvertime.deleteMany({ where: { employeeId: id } });
      if (overtimes.length > 0) {
        await tx.employeeOvertime.createMany({
          data: overtimes.map((item: any) => ({
            employeeId: id,
            title: String(item.title ?? ""),
            days: Number(item.days ?? 0),
            hours: Number(item.hours ?? 0),
            rate: Number(item.rate ?? 0),
          })),
        });
      }
    });

    return NextResponse.json({ success: true, message: "Salary updated successfully" });
  } catch (error: any) {
    console.error("Error updating employee salary:", error);
    const message =
      error?.message && typeof error.message === "string"
        ? error.message
        : "Gagal menyimpan. Periksa data (mis. ID option allowance/loan/deduction).";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
