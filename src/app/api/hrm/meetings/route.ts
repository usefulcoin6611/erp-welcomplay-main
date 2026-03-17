import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1, "Meeting title is required"),
  branch: z.string().min(1, "Branch is required"),
  department: z.string().min(1, "Department is required"),
  employeeId: z.string().min(1, "Employee is required"),
  meetingDate: z.string().min(1, "Meeting date is required"),
  meetingTime: z.string().min(1, "Meeting time is required"),
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

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const items = await prisma.hrmMeeting.findMany({
      where: { ownerId: companyId },
      include: { employee: { select: { name: true } } },
      orderBy: [{ meetingDate: "asc" }, { meetingTime: "asc" }],
    });
    return NextResponse.json({ success: true, data: items.map(toRow) });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const branchExists = await prisma.branch.findFirst({
      where: { name: parsed.data.branch.trim() },
    });
    if (!branchExists) {
      return NextResponse.json(
        { success: false, message: "Branch not found. Please select a branch from the list." },
        { status: 400 }
      );
    }
    const departmentExists = await prisma.department.findFirst({
      where: { name: parsed.data.department.trim() },
    });
    if (!departmentExists) {
      return NextResponse.json(
        { success: false, message: "Department not found. Please select a department from the list." },
        { status: 400 }
      );
    }
    const emp = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
    if (!emp) {
      return NextResponse.json({ success: false, message: "Employee not found" }, { status: 400 });
    }

    const meetingDate = new Date(parsed.data.meetingDate);
    if (Number.isNaN(meetingDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid meeting date" },
        { status: 400 }
      );
    }

    const { id: userId, role, ownerId: sessionOwnerId } = session.user as any;
    const companyId = role === "company" ? userId : sessionOwnerId;

    const item = await prisma.hrmMeeting.create({
      data: {
        title: parsed.data.title.trim(),
        branch: parsed.data.branch.trim(),
        department: parsed.data.department.trim(),
        employeeId: parsed.data.employeeId,
        meetingDate,
        meetingTime: parsed.data.meetingTime.trim(),
        note: parsed.data.note?.trim() || null,
        status: parsed.data.status ?? "Scheduled",
        ownerId: companyId,
      },
      include: { employee: { select: { name: true } } },
    });

    return NextResponse.json({ success: true, message: "Meeting created", data: toRow(item) });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create meeting" },
      { status: 500 }
    );
  }
}
