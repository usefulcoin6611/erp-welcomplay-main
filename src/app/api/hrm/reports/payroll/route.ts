import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

/**
 * GET /api/hrm/reports/payroll
 * Query: month (YYYY-MM), year, branchId, departmentId, employeeId
 * Returns payroll report data from Payslip + Employee, synced with HRM module.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const branchId = searchParams.get("branchId") || "";
    const departmentId = searchParams.get("departmentId") || "";
    const employeeId = searchParams.get("employeeId") || "";

    const user = session.user as { role?: string; branchId?: string | null };
    const role = user?.role ?? "";
    const userBranchId = user?.branchId ?? null;
    const scopeByBranch = role !== "super admin" && role !== "company" && !!userBranchId;

    let branchName: string | null = null;
    let departmentName: string | null = null;
    if (scopeByBranch && userBranchId) {
      const ub = await prisma.branch.findUnique({ where: { id: userBranchId }, select: { name: true } });
      branchName = ub?.name ?? null;
    } else if (branchId) {
      const b = await prisma.branch.findUnique({ where: { id: branchId }, select: { name: true } });
      branchName = b?.name ?? null;
    }
    if (departmentId) {
      const d = await prisma.department.findUnique({ where: { id: departmentId }, select: { name: true } });
      departmentName = d?.name ?? null;
    }

    const employeeWhere: Record<string, unknown> = {};
    if (branchName) employeeWhere.branch = branchName;
    if (departmentName) employeeWhere.department = departmentName;
    if (employeeId) employeeWhere.id = employeeId;

    const payslips = await prisma.payslip.findMany({
      where: {
        salaryMonth: month,
        employee: Object.keys(employeeWhere).length ? employeeWhere : undefined,
      },
      include: { employee: true },
      orderBy: { createdAt: "desc" },
    });

    const data = payslips.map((p) => ({
      id: p.id,
      employeeId: p.employee.employeeId,
      employeeDbId: p.employee.id,
      employeeName: p.employee.name,
      department: p.employee.department,
      branch: p.employee.branch,
      basicSalary: p.basicSalary,
      allowances: p.allowance + p.commission + p.otherPayment + p.overtime,
      deductions: p.loan + p.saturationDeduction,
      netSalary: p.netSalary,
      paymentDate: p.updatedAt.toISOString().slice(0, 10),
    }));

    const summary = {
      totalBasicSalary: data.reduce((s, i) => s + i.basicSalary, 0),
      totalAllowances: data.reduce((s, i) => s + i.allowances, 0),
      totalDeductions: data.reduce((s, i) => s + i.deductions, 0),
      totalNetSalary: data.reduce((s, i) => s + i.netSalary, 0),
      totalEmployees: data.length,
    };

    return NextResponse.json({ success: true, data, summary });
  } catch (error) {
    console.error("HRM reports payroll API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load payroll report" },
      { status: 500 }
    );
  }
}
