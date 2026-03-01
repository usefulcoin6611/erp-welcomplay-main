import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

/**
 * GET /api/hrm/reports/filters
 * Returns branch, department, and employee options for HRM report filters.
 * Synced with HRM module (Branch, Department, Employee).
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as { role?: string; branchId?: string | null };
    const role = user?.role ?? "";
    const branchId = user?.branchId ?? null;
    const scopeByBranch = role !== "super admin" && role !== "company" && !!branchId;

    const branchWhere = scopeByBranch && branchId ? { id: branchId } : {};
    const branches = await prisma.branch.findMany({
      where: branchWhere,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const departmentWhere = scopeByBranch && branchId ? { branchId } : {};
    const departments = await prisma.department.findMany({
      where: departmentWhere,
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    let branchName: string | null = null;
    if (scopeByBranch && branchId) {
      const b = await prisma.branch.findUnique({
        where: { id: branchId },
        select: { name: true },
      });
      branchName = b?.name ?? null;
    }
    const employeeWhere = scopeByBranch && branchName ? { branch: branchName, isActive: true } : { isActive: true };
    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      select: { id: true, employeeId: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        branches: branches.map((b) => ({ value: b.id, label: b.name })),
        departments: departments.map((d) => ({ value: d.id, label: d.name })),
        employees: employees.map((e) => ({ value: e.id, label: e.name, employeeId: e.employeeId })),
      },
    });
  } catch (error) {
    console.error("HRM reports filters API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load filter options" },
      { status: 500 }
    );
  }
}
