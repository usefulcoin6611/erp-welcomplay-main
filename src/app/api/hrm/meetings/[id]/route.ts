import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  branch: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  employeeId: z.string().min(1).optional(),
  meetingDate: z.string().min(1).optional(),
  meetingTime: z.string().min(1).optional(),
  note: z.string().optional(),
  status: z.string().optional(),
});

function toRow(m: {
  id: string;
  title: string;
  branch: string;
  department: string;
  employeeId: string;
  meetingDate: Date;
  meetingTime: string;
  note: string | null;
  status: string;
  employee?: { name: string } | null;
}) {
  return {
    id: m.id,
    title: m.title,
    branch: m.branch,
    department: m.department,
    employeeId: m.employeeId,
    employeeName: m.employee?.name ?? "",
    date: m.meetingDate.toISOString().split("T")[0],
    time: m.meetingTime,
    note: m.note ?? "",
    status: m.status,
  };
}

export async function GET(
  _r: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const item = await prisma.hrmMeeting.findUnique({
      where: { id },
      include: { employee: { select: { name: true } } },
    });
    if (!item)
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: toRow(item) });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const existing = await prisma.hrmMeeting.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    if (parsed.data.branch) {
      const branchExists = await prisma.branch.findFirst({
        where: { name: parsed.data.branch.trim() },
      });
      if (!branchExists) {
        return NextResponse.json(
          { success: false, message: "Branch not found. Please select a branch from the list." },
          { status: 400 }
        );
      }
    }
    if (parsed.data.department) {
      const departmentExists = await prisma.department.findFirst({
        where: { name: parsed.data.department.trim() },
      });
      if (!departmentExists) {
        return NextResponse.json(
          {
            success: false,
            message: "Department not found. Please select a department from the list.",
          },
          { status: 400 }
        );
      }
    }
    if (parsed.data.employeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
      if (!emp) {
        return NextResponse.json({ success: false, message: "Employee not found" }, { status: 400 });
      }
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title.trim();
    if (parsed.data.branch !== undefined) data.branch = parsed.data.branch.trim();
    if (parsed.data.department !== undefined) data.department = parsed.data.department.trim();
    if (parsed.data.employeeId !== undefined) data.employeeId = parsed.data.employeeId;
    if (parsed.data.meetingDate !== undefined) {
      const d = new Date(parsed.data.meetingDate);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { success: false, message: "Invalid meeting date" },
          { status: 400 }
        );
      }
      data.meetingDate = d;
    }
    if (parsed.data.meetingTime !== undefined) data.meetingTime = parsed.data.meetingTime.trim();
    if (parsed.data.note !== undefined) data.note = parsed.data.note?.trim() || null;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;

    const item = await prisma.hrmMeeting.update({
      where: { id },
      data,
      include: { employee: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, message: "Meeting updated", data: toRow(item) });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update meeting" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _r: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await prisma.hrmMeeting.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Meeting deleted" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete meeting" },
      { status: 500 }
    );
  }
}
