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

    const { id: userId, role: userRole, ownerId: sessionOwnerId } = session.user as any;
    const companyId = userRole === "company" ? userId : sessionOwnerId;

    const branches = await prisma.branch.findMany({
      where: { ownerId: companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const departments = await prisma.department.findMany({
      where: { ownerId: companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const employees = await prisma.employee.findMany({
      where: { ownerId: companyId, isActive: true },
      select: { id: true, employeeId: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        branches: branches.map((b: any) => ({ value: b.id, label: b.name })),
        departments: departments.map((d: any) => ({ value: d.id, label: d.name })),
        employees: employees.map((e: any) => ({ value: e.id, label: e.name, employeeId: e.employeeId })),
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
