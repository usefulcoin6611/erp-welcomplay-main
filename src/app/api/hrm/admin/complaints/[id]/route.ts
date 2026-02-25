import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  employeeFromId: z.string().min(1).optional(),
  complaintAgainstId: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["Pending", "In Progress", "Resolved"]).optional(),
});

function toRow(c: {
  id: string;
  employeeFromId: string;
  complaintAgainstId: string;
  title: string;
  date: Date;
  description: string | null;
  status: string;
  employeeFrom: { name: string };
  complaintAgainst: { name: string };
}) {
  return {
    id: c.id,
    employeeFromId: c.employeeFromId,
    employeeFrom: c.employeeFrom.name,
    complaintAgainstId: c.complaintAgainstId,
    complaintAgainst: c.complaintAgainst.name,
    title: c.title,
    date: c.date.toISOString().split("T")[0],
    description: c.description ?? "",
    status: c.status,
  };
}

export async function GET(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const item = await prisma.hrmComplaint.findUnique({
      where: { id },
      include: {
        employeeFrom: { select: { name: true } },
        complaintAgainst: { select: { name: true } },
      },
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
      return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const existing = await prisma.hrmComplaint.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    if (parsed.data.employeeFromId) {
      const emp = await prisma.employee.findUnique({ where: { id: parsed.data.employeeFromId } });
      if (!emp) return NextResponse.json({ success: false, message: "Employee (from) not found" }, { status: 400 });
    }
    if (parsed.data.complaintAgainstId) {
      const emp = await prisma.employee.findUnique({ where: { id: parsed.data.complaintAgainstId } });
      if (!emp) return NextResponse.json({ success: false, message: "Employee (against) not found" }, { status: 400 });
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.employeeFromId) data.employeeFromId = parsed.data.employeeFromId;
    if (parsed.data.complaintAgainstId) data.complaintAgainstId = parsed.data.complaintAgainstId;
    if (parsed.data.title) data.title = parsed.data.title;
    if (parsed.data.date) data.date = new Date(parsed.data.date);
    if (parsed.data.description !== undefined) data.description = parsed.data.description?.trim() || null;
    if (parsed.data.status) data.status = parsed.data.status;
    const item = await prisma.hrmComplaint.update({
      where: { id },
      data,
      include: {
        employeeFrom: { select: { name: true } },
        complaintAgainst: { select: { name: true } },
      },
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
    await prisma.hrmComplaint.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
