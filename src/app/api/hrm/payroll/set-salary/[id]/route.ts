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

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const { id } = await params;

    const employee = await prisma.employee.findFirst({
      where: { 
        id,
        ownerId: companyId
      },
      include: {
        allowances: { include: { allowanceOption: true } },
        commissions: true,
        loans: { include: { loanOption: true } },
        saturationDeductions: { include: { deductionOption: true } },
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

    const data = {
      ...employee,
      allowances: (employee as any).allowances?.map((a: any) => ({
        id: a.id,
        allowanceOptionId: a.allowanceOptionId,
        title: a.title,
        amount: a.amount,
        type: a.type,
      })) ?? [],
      commissions: (employee as any).commissions?.map((c: any) => ({
        id: c.id,
        title: c.title,
        amount: c.amount,
        type: c.type,
      })) ?? [],
      loans: (employee as any).loans?.map((l: any) => ({
        id: l.id,
        loanOptionId: l.loanOptionId,
        title: l.title,
        amount: l.amount,
        startDate: l.startDate?.toISOString?.()?.split("T")[0] ?? "",
        endDate: l.endDate?.toISOString?.()?.split("T")[0] ?? "",
        reason: l.reason ?? "",
      })) ?? [],
      saturationDeductions: (employee as any).saturationDeductions?.map((s: any) => ({
        id: s.id,
        deductionOptionId: s.deductionOptionId,
        title: s.title,
        amount: s.amount,
        type: s.type,
      })) ?? [],
      otherPayments: (employee as any).otherPayments?.map((o: any) => ({
        id: o.id,
        title: o.title,
        amount: o.amount,
        type: o.type,
      })) ?? [],
      overtimes: (employee as any).overtimes?.map((o: any) => ({
        id: o.id,
        title: o.title,
        days: o.days,
        hours: o.hours,
        rate: o.rate,
      })) ?? [],
    };

    return NextResponse.json({ success: true, data });
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

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const { id } = await params;
    
    // Authorization check
    const employeeExist = await prisma.employee.findFirst({
      where: { id, ownerId: companyId },
      select: { id: true }
    });

    if (!employeeExist) {
      return NextResponse.json(
        { success: false, message: "Employee not found or unauthorized" },
        { status: 404 }
      );
    }

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

    const employeeUpdateData: any = {
      basicSalary: Number(body.basicSalary),
      salaryType: body.salaryType,
    };

    if (body.bankAccountId) {
      const bank = await prisma.bankAccount.findUnique({
        where: { id: String(body.bankAccountId) },
        include: { chartAccount: true },
      });
      if (bank) {
        employeeUpdateData.accountNumber = bank.accountNumber;
        employeeUpdateData.bankName = bank.bank;
        employeeUpdateData.bankIdentifierCode = bank.chartAccount?.code ?? null;
      }
    }

    const allowances = Array.isArray(body.allowances) ? body.allowances : [];
    const commissions = Array.isArray(body.commissions) ? body.commissions : [];
    const loans = Array.isArray(body.loans) ? body.loans : [];
    const saturationDeductions = Array.isArray(body.saturationDeductions) ? body.saturationDeductions : [];
    const otherPayments = Array.isArray(body.otherPayments) ? body.otherPayments : [];
    const overtimes = Array.isArray(body.overtimes) ? body.overtimes : [];

    await prisma.$transaction(async (tx: any) => {
      await tx.employee.update({
        where: { id },
        data: employeeUpdateData,
      });

      await tx.employeeAllowance.deleteMany({ where: { employeeId: id } });
      if (allowances.length > 0) {
        await tx.employeeAllowance.createMany({
          data: allowances.map((a: any) => ({
            employeeId: id,
            allowanceOptionId: String(a.allowanceOptionId ?? ""),
            title: String(a.title ?? ""),
            amount: Number(a.amount ?? 0),
            type: String(a.type ?? "Fixed"),
          })),
        });
      }

      await tx.employeeCommission.deleteMany({ where: { employeeId: id } });
      if (commissions.length > 0) {
        await tx.employeeCommission.createMany({
          data: commissions.map((c: any) => ({
            employeeId: id,
            title: String(c.title ?? ""),
            amount: Number(c.amount ?? 0),
            type: String(c.type ?? "Fixed"),
          })),
        });
      }

      await tx.employeeLoan.deleteMany({ where: { employeeId: id } });
      if (loans.length > 0) {
        const now = new Date();
        const endDefault = new Date(now);
        endDefault.setMonth(endDefault.getMonth() + 6);
        await tx.employeeLoan.createMany({
          data: loans.map((l: any) => ({
            employeeId: id,
            loanOptionId: String(l.loanOptionId ?? ""),
            title: String(l.title ?? ""),
            amount: Number(l.amount ?? 0),
            startDate: l.startDate ? new Date(l.startDate) : now,
            endDate: l.endDate ? new Date(l.endDate) : endDefault,
            reason: l.reason != null ? String(l.reason) : null,
          })),
        });
      }

      await tx.employeeSaturationDeduction.deleteMany({ where: { employeeId: id } });
      if (saturationDeductions.length > 0) {
        await tx.employeeSaturationDeduction.createMany({
          data: saturationDeductions.map((s: any) => ({
            employeeId: id,
            deductionOptionId: String(s.deductionOptionId ?? ""),
            title: String(s.title ?? ""),
            amount: Number(s.amount ?? 0),
            type: String(s.type ?? "Fixed"),
          })),
        });
      }

      await tx.employeeOtherPayment.deleteMany({ where: { employeeId: id } });
      if (otherPayments.length > 0) {
        await tx.employeeOtherPayment.createMany({
          data: otherPayments.map((o: any) => ({
            employeeId: id,
            title: String(o.title ?? ""),
            amount: Number(o.amount ?? 0),
            type: String(o.type ?? "Fixed"),
          })),
        });
      }

      await tx.employeeOvertime.deleteMany({ where: { employeeId: id } });
      if (overtimes.length > 0) {
        await tx.employeeOvertime.createMany({
          data: overtimes.map((o: any) => ({
            employeeId: id,
            title: String(o.title ?? ""),
            days: Number(o.days ?? 0),
            hours: Number(o.hours ?? 0),
            rate: Number(o.rate ?? 0),
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
