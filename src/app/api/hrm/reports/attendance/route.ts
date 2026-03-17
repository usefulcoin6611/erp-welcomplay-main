import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

/**
 * GET /api/hrm/reports/attendance
 * Query: month (YYYY-MM), branchId, departmentId, employeeId (optional, single)
 * Returns monthly attendance report: per-employee, per-day status (P/A/L), synced with HRM module.
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

    const [y, m] = month.split("-").map(Number);
    const monthStart = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(y, m, 0, 23, 59, 59, 999);
    const daysInMonth = new Date(y, m, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, "0"));

    const { id: userId, role: userRole, ownerId } = session.user as any;
    const companyId = userRole === "company" ? userId : ownerId;

    let branchName: string | null = null;
    let departmentName: string | null = null;
    
    if (branchId) {
      const b = await prisma.branch.findFirst({ where: { id: branchId, ownerId: companyId }, select: { name: true } });
      branchName = b?.name ?? null;
    }
    if (departmentId) {
      const d = await prisma.department.findFirst({ where: { id: departmentId, ownerId: companyId }, select: { name: true } });
      departmentName = d?.name ?? null;
    }

    const employeeWhere: any = {
      isActive: true,
      ownerId: companyId,
    };
    if (branchName) employeeWhere.branch = branchName;
    if (departmentName) employeeWhere.department = departmentName;
    if (employeeId) employeeWhere.id = employeeId;

    const [employees, attendanceRecords] = await Promise.all([
      prisma.employee.findMany({
        where: employeeWhere,
        select: { id: true, employeeId: true, name: true, branch: true, department: true },
        orderBy: { name: "asc" },
      }),
      prisma.attendance.findMany({
        where: {
          date: { gte: monthStart, lte: monthEnd },
          employee: employeeWhere,
        },
        select: { employeeId: true, date: true, status: true, clockIn: true, clockOut: true },
      }),
    ]);

    const statusToCode = (s: string): "P" | "A" | "L" => {
      const lower = (s || "").toLowerCase();
      if (lower === "present") return "P";
      if (lower === "leave" || lower === "on leave") return "L";
      return "A";
    };

    const byEmployee = new Map<string, { [date: string]: "P" | "A" | "L" }>();
    for (const emp of employees as any[]) {
      byEmployee.set(emp.id, {});
    }
    for (const a of attendanceRecords as any[]) {
      const day = a.date.getDate().toString().padStart(2, "0");
      const map = byEmployee.get(a.employeeId);
      if (map) map[day] = statusToCode(a.status);
    }

    const data = employees.map((emp: any) => ({
      employeeId: emp.employeeId,
      employeeName: emp.name,
      department: emp.department,
      branch: emp.branch,
      attendance: byEmployee.get(emp.id) ?? {},
    }));

    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    let totalLate = 0;
    let overtimeHours = 0;
    let earlyLeaveHours = 0;
    for (const a of attendanceRecords as any[]) {
      const code = statusToCode(a.status);
      if (code === "P") totalPresent++;
      else if (code === "A") totalAbsent++;
      else totalLeave++;
      if (a.clockIn && a.clockOut) {
        const diff = (a.clockOut.getTime() - a.clockIn.getTime()) / (1000 * 60 * 60);
        if (diff > 8) overtimeHours += diff - 8;
      }
    }

    const summary = {
      totalPresent,
      totalAbsent,
      totalLeave,
      totalLate,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      earlyLeaveHours: Math.round(earlyLeaveHours * 100) / 100,
    };

    return NextResponse.json({ success: true, data, dates, summary });
  } catch (error) {
    console.error("HRM reports attendance API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load attendance report" },
      { status: 500 }
    );
  }
}
