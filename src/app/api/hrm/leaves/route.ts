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
    const employeeIdParam = searchParams.get("employeeId");
    const status = searchParams.get("status");

    const { id: userId, role, ownerId: sessionOwnerId } = session.user as any;
    const companyId = role === "company" ? userId : sessionOwnerId;

    const whereClause: any = {
      employee: {
        ownerId: companyId,
      },
    };

    const isEmployee = role === "employee";
    if (isEmployee) {
      const myEmployee = await prisma.employee.findFirst({
        where: { userId: userId },
        select: { id: true },
      });
      if (myEmployee) whereClause.employeeId = myEmployee.id;
      else whereClause.employeeId = "none";
    } else {
      if (employeeIdParam) whereClause.employeeId = employeeIdParam;
    }
    if (status) whereClause.status = status;

    const leaves = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        employee: true,
        leaveType: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: leaves });
  } catch (error: any) {
    console.error("Error fetching leaves:", error);
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
    const { employeeId: bodyEmployeeId, leaveTypeId, startDate, endDate, reason } = body;

    const isEmployee = (session.user as { role?: string })?.role === "employee";

    let employeeId: string;
    if (isEmployee) {
      const myEmployee = await prisma.employee.findFirst({
        where: { userId: session.user.id },
      });
      if (!myEmployee) {
        return NextResponse.json(
          { success: false, message: "Employee record not linked. Please contact HR." },
          { status: 400 }
        );
      }
      employeeId = myEmployee.id;
    } else {
      if (!bodyEmployeeId) {
        return NextResponse.json(
          { success: false, message: "Employee, leave type, start date, and end date are required" },
          { status: 400 }
        );
      }
      employeeId = String(bodyEmployeeId);
    }

    if (!leaveTypeId || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Leave type, start date, and end date are required" },
        { status: 400 }
      );
    }

    const sd = new Date(startDate);
    const ed = new Date(endDate);

    if (isNaN(sd.getTime()) || isNaN(ed.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid start or end date" },
        { status: 400 }
      );
    }

    if (ed < sd) {
      return NextResponse.json(
        { success: false, message: "End date must be after start date" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 400 }
      );
    }

    const leaveType = await prisma.leaveType.findUnique({ where: { id: String(leaveTypeId) } });
    if (!leaveType) {
      return NextResponse.json(
        { success: false, message: "Leave type tidak ditemukan" },
        { status: 400 }
      );
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId: String(employeeId),
        leaveTypeId: String(leaveTypeId),
        startDate: sd,
        endDate: ed,
        reason: reason ? String(reason) : null,
        status: "Pending",
      },
    });

    return NextResponse.json({ success: true, data: leave, message: "Leave requested successfully" });
  } catch (error: any) {
    console.error("Error creating leave:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
