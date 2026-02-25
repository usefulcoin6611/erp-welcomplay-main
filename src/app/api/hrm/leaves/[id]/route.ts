import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

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

    const { status, employeeId, leaveTypeId, startDate, endDate, reason } = body;

    const data: any = {};

    if (status) {
      data.status = String(status);
    }
    if (employeeId) {
      data.employeeId = String(employeeId);
    }
    if (leaveTypeId) {
      data.leaveTypeId = String(leaveTypeId);
    }
    if (startDate) {
      const sd = new Date(startDate);
      if (isNaN(sd.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid startDate" },
          { status: 400 },
        );
      }
      data.startDate = sd;
    }
    if (endDate) {
      const ed = new Date(endDate);
      if (isNaN(ed.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid endDate" },
          { status: 400 },
        );
      }
      data.endDate = ed;
    }
    if (reason !== undefined) {
      data.reason = reason === null ? null : String(reason);
    }

    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      return NextResponse.json(
        { success: false, message: "End date must be after start date" },
        { status: 400 },
      );
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 },
      );
    }

    await prisma.leaveRequest.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, message: "Leave updated successfully" });
  } catch (error: any) {
    console.error("Error updating leave:", error);
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

    await prisma.leaveRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Leave request deleted" });
  } catch (error: any) {
    console.error("Error deleting leave:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
