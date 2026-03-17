import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  branch: z.string().min(1, "Branch is required"),
  department: z.string().min(1, "Department is required"),
  employeeId: z.string().min(1).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  color: z.string().min(1, "Color is required"),
  description: z.string().optional(),
});

function toRow(e: {
  id: string;
  title: string;
  branch: string;
  department: string;
  employeeId: string | null;
  startDate: Date;
  endDate: Date;
  color: string;
  description: string | null;
  employee?: { name: string } | null;
}) {
  return {
    id: e.id,
    title: e.title,
    branch: e.branch,
    department: e.department,
    employeeId: e.employeeId,
    employeeName: e.employee?.name ?? "",
    startDate: e.startDate.toISOString().split("T")[0],
    endDate: e.endDate.toISOString().split("T")[0],
    color: e.color,
    description: e.description ?? "",
  };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const items = await prisma.hrmEvent.findMany({
      where: { ownerId: companyId },
      include: { employee: { select: { name: true } } },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json({ success: true, data: items.map(toRow) });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch events" }, { status: 500 });
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
        { status: 400 },
      );
    }

    const branchExists = await prisma.branch.findFirst({
      where: { name: parsed.data.branch.trim() },
    });
    if (!branchExists) {
      return NextResponse.json(
        { success: false, message: "Branch not found. Please select a branch from the list." },
        { status: 400 },
      );
    }
    const departmentExists = await prisma.department.findFirst({
      where: { name: parsed.data.department.trim() },
    });
    if (!departmentExists) {
      return NextResponse.json(
        { success: false, message: "Department not found. Please select a department from the list." },
        { status: 400 },
      );
    }
    if (parsed.data.employeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
      if (!emp) {
        return NextResponse.json({ success: false, message: "Employee not found" }, { status: 400 });
      }
    }

    const start = new Date(parsed.data.startDate);
    const end = new Date(parsed.data.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return NextResponse.json(
        { success: false, message: "End date must be after or equal to start date" },
        { status: 400 },
      );
    }

    const { id: userId, role, ownerId: sessionOwnerId } = session.user as any;
    const companyId = role === "company" ? userId : sessionOwnerId;

    const item = await prisma.hrmEvent.create({
      data: {
        title: parsed.data.title,
        branch: parsed.data.branch,
        department: parsed.data.department,
        employeeId: parsed.data.employeeId ?? null,
        startDate: start,
        endDate: end,
        color: parsed.data.color,
        description: parsed.data.description?.trim() || null,
        ownerId: companyId,
      },
      include: { employee: { select: { name: true } } },
    });

    return NextResponse.json({ success: true, message: "Event created", data: toRow(item) });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ success: false, message: "Failed to create event" }, { status: 500 });
  }
}

