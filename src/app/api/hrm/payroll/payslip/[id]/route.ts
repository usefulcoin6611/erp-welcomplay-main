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

    const payslip = await prisma.payslip.findUnique({
      where: { id },
      include: {
        employee: true,
        payslipType: true,
      },
    });

    if (!payslip) {
      return NextResponse.json(
        { success: false, message: "Payslip not found" },
        { status: 404 }
      );
    }

    const allowanceTotal =
      (payslip.allowance ?? 0) +
      (payslip.commission ?? 0) +
      (payslip.otherPayment ?? 0) +
      (payslip.overtime ?? 0);
    const deductionTotal =
      (payslip.loan ?? 0) + (payslip.saturationDeduction ?? 0);

    const [year, month] = (payslip.salaryMonth ?? "").split("-");

    const data = {
      id: payslip.id,
      employeeId: payslip.employee.employeeId,
      employeeName: payslip.employee.name,
      salaryMonth: payslip.salaryMonth,
      year,
      month,
      payrollType: payslip.employee.salaryType ?? "Monthly",
      basicSalary: payslip.basicSalary,
      allowance: payslip.allowance,
      commission: payslip.commission,
      loan: payslip.loan,
      saturationDeduction: payslip.saturationDeduction,
      otherPayment: payslip.otherPayment,
      overtime: payslip.overtime,
      netSalary: payslip.netSalary,
      totalAllowances: allowanceTotal,
      totalDeductions: deductionTotal,
      status: payslip.status === 1 ? "Paid" : "UnPaid",
      paidAt: payslip.status === 1 ? payslip.updatedAt : null,
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching payslip detail:", error);
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
    const body = await request.json();

    const data: any = {};

    if (body.status !== undefined) {
      data.status = Number(body.status);
    }
    if (body.basicSalary !== undefined) {
      data.basicSalary = Number(body.basicSalary);
    }
    if (body.allowances !== undefined) {
      // Simpan total allowance gabungan ke kolom allowance
      data.allowance = Number(body.allowances);
    }
    if (body.deductions !== undefined) {
      // Simpan total deduction gabungan ke kolom saturationDeduction
      data.saturationDeduction = Number(body.deductions);
    }
    if (body.netSalary !== undefined) {
      data.netSalary = Number(body.netSalary);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 }
      );
    }

    await prisma.payslip.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, message: "Payslip updated" });
  } catch (error: any) {
    console.error("Error updating payslip:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
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

    await prisma.payslip.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Payslip deleted" });
  } catch (error: any) {
    console.error("Error deleting payslip:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
