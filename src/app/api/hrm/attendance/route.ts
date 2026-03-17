import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date"); // YYYY-MM-DD
    const month = searchParams.get("month"); // YYYY-MM
    const branchId = searchParams.get("branchId");
    const departmentId = searchParams.get("departmentId");

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const whereClause: any = {
      employee: {
        ownerId: companyId,
      },
    };

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (month) {
      const [year, m] = month.split("-");
      const startDate = new Date(Number(year), Number(m) - 1, 1);
      const endDate = new Date(Number(year), Number(m), 0, 23, 59, 59, 999);
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (branchId || departmentId) {
      if (branchId) whereClause.employee.branch = branchId;
      if (departmentId) whereClause.employee.department = departmentId;
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, data: attendance });
  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { employeeId, date, clockIn, clockOut, status } = body;
    // For Bulk: body.employees = [{employeeId, status, ...}]

    if (body.employees && Array.isArray(body.employees)) {
      // Bulk Attendance
      const { date: bulkDate, employees } = body;
      const targetDate = new Date(bulkDate);

      // Upsert logic for each
      for (const emp of employees) {
        await prisma.attendance.upsert({
          where: {
            employeeId_date: {
              employeeId: emp.employeeId,
              date: targetDate,
            },
          },
          update: {
            status: emp.status,
            clockIn: emp.clockIn ? new Date(`${bulkDate}T${emp.clockIn}`) : null,
            clockOut: emp.clockOut ? new Date(`${bulkDate}T${emp.clockOut}`) : null,
          },
          create: {
            employeeId: emp.employeeId,
            date: targetDate,
            status: emp.status || "Present",
            clockIn: emp.clockIn ? new Date(`${bulkDate}T${emp.clockIn}`) : null,
            clockOut: emp.clockOut ? new Date(`${bulkDate}T${emp.clockOut}`) : null,
          },
        });
      }
      return NextResponse.json({ success: true, message: "Bulk attendance marked" });
    } else {
      // Single Attendance
      const targetDate = new Date(date);
      await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId,
            date: targetDate,
          },
        },
        update: {
          status,
          clockIn: clockIn ? new Date(`${date}T${clockIn}`) : undefined,
          clockOut: clockOut ? new Date(`${date}T${clockOut}`) : undefined,
        },
        create: {
          employeeId,
          date: targetDate,
          status: status || "Present",
          clockIn: clockIn ? new Date(`${date}T${clockIn}`) : null,
          clockOut: clockOut ? new Date(`${date}T${clockOut}`) : null,
        },
      });
      return NextResponse.json({ success: true, message: "Attendance marked" });
    }
  } catch (error: any) {
    console.error("Error marking attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
