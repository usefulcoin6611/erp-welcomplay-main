import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  branch: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  employeeId: z.string().min(1).optional().nullable(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
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

export async function GET(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const item = await prisma.hrmEvent.findUnique({
      where: { id },
      include: { employee: { select: { name: true } } },
    });
    if (!item) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: toRow(item) });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const existing = await prisma.hrmEvent.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    if (parsed.data.branch) {
      const branchExists = await prisma.branch.findFirst({
        where: { name: parsed.data.branch.trim() },
      });
      if (!branchExists) {
        return NextResponse.json(
          { success: false, message: "Branch not found. Please select a branch from the list." },
          { status: 400 },
        );
      }
    }
    if (parsed.data.department) {
      const departmentExists = await prisma.department.findFirst({
        where: { name: parsed.data.department.trim() },
      });
      if (!departmentExists) {
        return NextResponse.json(
          { success: false, message: "Department not found. Please select a department from the list." },
          { status: 400 },
        );
      }
    }
    if (parsed.data.employeeId != null && parsed.data.employeeId !== "") {
      const emp = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
      if (!emp) {
        return NextResponse.json({ success: false, message: "Employee not found" }, { status: 400 });
      }
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.title) data.title = parsed.data.title;
    if (parsed.data.branch) data.branch = parsed.data.branch;
    if (parsed.data.department) data.department = parsed.data.department;
    if (parsed.data.employeeId !== undefined) data.employeeId = parsed.data.employeeId === "" || parsed.data.employeeId == null ? null : parsed.data.employeeId;
    if (parsed.data.startDate) data.startDate = new Date(parsed.data.startDate);
    if (parsed.data.endDate) data.endDate = new Date(parsed.data.endDate);
    if (parsed.data.color) data.color = parsed.data.color;
    if (parsed.data.description !== undefined) data.description = parsed.data.description?.trim() || null;

    // Validate date range if we have both
    if (data.startDate || data.endDate) {
      const start = (data.startDate as Date) ?? existing.startDate;
      const end = (data.endDate as Date) ?? existing.endDate;
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
        return NextResponse.json(
          { success: false, message: "End date must be after or equal to start date" },
          { status: 400 },
        );
      }
    }

    const item = await prisma.hrmEvent.update({
      where: { id },
      data,
      include: { employee: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, message: "Updated", data: toRow(item) });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    await prisma.hrmEvent.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}

