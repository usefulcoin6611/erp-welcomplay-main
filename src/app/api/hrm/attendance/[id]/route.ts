import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!attendance) {
      return NextResponse.json(
        { success: false, message: "Attendance not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: attendance });
  } catch (error: any) {
    console.error("Error fetching attendance detail:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    const { date, status, clockIn, clockOut } = body as {
      date?: string;
      status?: string;
      clockIn?: string | null;
      clockOut?: string | null;
    };

    const data: Record<string, unknown> = {};

    if (typeof status === "string" && status.trim().length > 0) {
      data.status = status.trim();
    }

    if (typeof date === "string" && date.length > 0) {
      const parsed = new Date(date);
      if (Number.isNaN(parsed.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid date" },
          { status: 400 },
        );
      }
      data.date = parsed;
    }

    if (clockIn !== undefined) {
      if (clockIn === null || clockIn === "") {
        data.clockIn = null;
      } else {
        const parsedClockIn = new Date(
          `${date ?? ""}T${clockIn}`,
        );
        if (Number.isNaN(parsedClockIn.getTime())) {
          return NextResponse.json(
            { success: false, message: "Invalid clockIn time" },
            { status: 400 },
          );
        }
        data.clockIn = parsedClockIn;
      }
    }

    if (clockOut !== undefined) {
      if (clockOut === null || clockOut === "") {
        data.clockOut = null;
      } else {
        const parsedClockOut = new Date(
          `${date ?? ""}T${clockOut}`,
        );
        if (Number.isNaN(parsedClockOut.getTime())) {
          return NextResponse.json(
            { success: false, message: "Invalid clockOut time" },
            { status: 400 },
          );
        }
        data.clockOut = parsedClockOut;
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, message: "No fields to update" },
        { status: 400 },
      );
    }

    const updated = await prisma.attendance.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Attendance updated",
    });
  } catch (error: any) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.attendance.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance deleted",
    });
  } catch (error: any) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

