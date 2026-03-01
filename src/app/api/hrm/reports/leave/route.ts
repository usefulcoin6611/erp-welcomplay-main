import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

/**
 * GET /api/hrm/reports/leave
 * Query: month (YYYY-MM), year, branchId, departmentId
 * Returns leave report from LeaveRequest + Employee, synced with HRM module.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const year = searchParams.get("year") || new Date().getFullYear().toString();
    const branchId = searchParams.get("branchId") || "";
    const departmentId = searchParams.get("departmentId") || "";

    const [y, m] = month.split("-").map(Number);
    const monthStart = new Date(y, m - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(y, m, 0, 23, 59, 59, 999);

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

    const leaves = await prisma.leaveRequest.findMany({
      where: {
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
        employee: Object.keys(employeeWhere).length ? employeeWhere : undefined,
      },
      include: { employee: true, leaveType: true },
      orderBy: { startDate: "desc" },
    });

    const statusMap: Record<string, "approved" | "pending" | "rejected"> = {
      Approved: "approved",
      Pending: "pending",
      Rejected: "rejected",
    };

    type LeaveRow = {
      id: string;
      employeeId: string;
      employeeName: string;
      department: string;
      branch: string;
      leaveType: string;
      startDate: string;
      endDate: string;
      days: number;
      reason: string;
      status: "approved" | "pending" | "rejected";
      appliedDate: string;
    };

    const data: LeaveRow[] = leaves.map((l: { id: string; startDate: Date; endDate: Date; employee: { employeeId: string; name: string; department: string; branch: string }; leaveType: { name: string } | null; reason: string | null; status: string; createdAt: Date }) => {
      const start = l.startDate.getTime();
      const end = l.endDate.getTime();
      const days = Math.max(1, Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1);
      return {
        id: l.id,
        employeeId: l.employee.employeeId,
        employeeName: l.employee.name,
        department: l.employee.department,
        branch: l.employee.branch,
        leaveType: (l.leaveType?.name ?? "Leave").toLowerCase().replace(/\s+/g, "-"),
        startDate: l.startDate.toISOString().slice(0, 10),
        endDate: l.endDate.toISOString().slice(0, 10),
        days,
        reason: l.reason ?? "",
        status: (statusMap[l.status] ?? "pending") as "approved" | "pending" | "rejected",
        appliedDate: l.createdAt.toISOString().slice(0, 10),
      };
    });

    const summary = {
      totalApproved: data.filter((i: LeaveRow) => i.status === "approved").length,
      totalPending: data.filter((i: LeaveRow) => i.status === "pending").length,
      totalRejected: data.filter((i: LeaveRow) => i.status === "rejected").length,
      totalLeaves: data.length,
      totalDays: data.reduce((s: number, i: LeaveRow) => s + i.days, 0),
    };

    return NextResponse.json({ success: true, data, summary });
  } catch (error) {
    console.error("HRM reports leave API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load leave report" },
      { status: 500 }
    );
  }
}
