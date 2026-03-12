/**
 * GET /api/attendance/me - Fetch current user's attendance history (employee self-service)
 * POST /api/attendance/me - Clock in/out for current user
 * Business logic: one record per employee per calendar day (server local); status Present/Absent/Leave.
 * Syncs with HRM: approved leave requests appear as Leave; HR-marked Leave blocks self-service clock in.
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "employee") {
      return NextResponse.json({ error: "For employee use only" }, { status: 403 });
    }

    const employee = await prisma.employee.findFirst({
      where: { userId: session.user.id },
    });
    if (!employee) {
      return NextResponse.json({
        success: true,
        data: [],
        serverToday: formatDateKey(new Date()),
        message: "Employee record not linked. Please contact HR.",
      });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const limit = Math.min(parseInt(searchParams.get("limit") || "30", 10), 90);

    const whereClause: { employeeId: string; date?: { gte: Date; lte: Date } } = {
      employeeId: employee.id,
    };
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (month) {
      const [year, m] = month.split("-").map(Number);
      startDate = new Date(year, m - 1, 1);
      endDate = new Date(year, m, 0, 23, 59, 59, 999);
      whereClause.date = { gte: startDate, lte: endDate };
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      take: limit,
    });

    const dateToRecord = new Map<string, { id: string; date: string; status: string; clockIn: Date | null; clockOut: Date | null }>();
    for (const a of attendance) {
      const key = formatDateKey(new Date(a.date));
      dateToRecord.set(key, {
        id: a.id,
        date: key,
        status: a.status,
        clockIn: a.clockIn,
        clockOut: a.clockOut,
      });
    }

    // Sync with HRM: add synthetic Leave for approved leave requests in range
    if (startDate && endDate) {
      const approved = await prisma.leaveRequest.findMany({
        where: {
          employeeId: employee.id,
          status: "Approved",
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      });
      for (const lv of approved) {
        const start = new Date(lv.startDate);
        const end = new Date(lv.endDate);
        const day = new Date(start);
        day.setHours(0, 0, 0, 0);
        const endDay = new Date(end);
        endDay.setHours(23, 59, 59, 999);
        while (day <= endDay) {
          if (day >= startDate && day <= endDate) {
            const key = formatDateKey(day);
            if (!dateToRecord.has(key)) {
              dateToRecord.set(key, {
                id: `leave-${key}`,
                date: key,
                status: "Leave",
                clockIn: null,
                clockOut: null,
              });
            }
          }
          day.setDate(day.getDate() + 1);
        }
      }
    }

    const data = Array.from(dateToRecord.values())
      .map((r) => ({
        id: r.id,
        date: r.date,
        status: r.status,
        clockIn: r.clockIn,
        clockOut: r.clockOut,
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);

    const serverToday = formatDateKey(new Date());
    return NextResponse.json({ success: true, data, serverToday });
  } catch (error) {
    console.error("Error fetching my attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "employee") {
      return NextResponse.json({ error: "For employee use only" }, { status: 403 });
    }

    const employee = await prisma.employee.findFirst({
      where: { userId: session.user.id },
    });
    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee record not linked. Please contact HR to set up your account." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, date } = body;
    // Use server local calendar date for consistency with HRM and reporting
    const now = new Date();
    const dateStr =
      date && typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? date
        : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const [y, m, day] = dateStr.split("-").map(Number);
    const targetDate = new Date(y, m - 1, day);

    const existing = await prisma.attendance.findUnique({
      where: {
        employeeId_date: { employeeId: employee.id, date: targetDate },
      },
    });

    if (action === "clock_in") {
      if (existing?.status === "Leave") {
        return NextResponse.json(
          { success: false, message: "This day is marked as leave. Clock in is not allowed." },
          { status: 400 }
        );
      }
      if (existing?.clockIn) {
        return NextResponse.json(
          { success: false, message: "You have already clocked in today." },
          { status: 400 }
        );
      }
      const clockInTime = new Date(y, m - 1, day, now.getHours(), now.getMinutes(), 0);
      await prisma.attendance.upsert({
        where: {
          employeeId_date: { employeeId: employee.id, date: targetDate },
        },
        update: {
          clockIn: existing?.clockIn ?? clockInTime,
          status: "Present",
        },
        create: {
          employeeId: employee.id,
          date: targetDate,
          status: "Present",
          clockIn: clockInTime,
        },
      });
      return NextResponse.json({ success: true, message: "Clock in recorded." });
    }

    if (action === "clock_out") {
      if (!existing?.clockIn) {
        return NextResponse.json(
          { success: false, message: "Please clock in first." },
          { status: 400 }
        );
      }
      if (existing.clockOut) {
        return NextResponse.json(
          { success: false, message: "You have already clocked out today." },
          { status: 400 }
        );
      }
      const clockOutTime = new Date(y, m - 1, day, now.getHours(), now.getMinutes(), 0);
      await prisma.attendance.update({
        where: {
          employeeId_date: { employeeId: employee.id, date: targetDate },
        },
        data: {
          clockOut: clockOutTime,
        },
      });
      return NextResponse.json({ success: true, message: "Clock out recorded." });
    }

    return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error marking attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
