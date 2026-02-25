import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  employeeId: z.string().min(1).optional(),
  noticeDate: z.string().min(1).optional(),
  lastWorkingDate: z.string().min(1).optional(),
  reason: z.string().optional(),
});

function toRow(r: { id: string; employeeId: string; noticeDate: Date; lastWorkingDate: Date; reason: string | null; employee: { name: string } }) {
  return {
    id: r.id,
    employeeId: r.employeeId,
    employeeName: r.employee.name,
    noticeDate: r.noticeDate.toISOString().split("T")[0],
    lastWorkingDate: r.lastWorkingDate.toISOString().split("T")[0],
    reason: r.reason ?? "",
  };
}

export async function GET(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const item = await prisma.hrmResignation.findUnique({
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
      return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const existing = await prisma.hrmResignation.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    if (parsed.data.employeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
      if (!emp) return NextResponse.json({ success: false, message: "Employee not found" }, { status: 400 });
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.employeeId) data.employeeId = parsed.data.employeeId;
    if (parsed.data.noticeDate) data.noticeDate = new Date(parsed.data.noticeDate);
    if (parsed.data.lastWorkingDate) data.lastWorkingDate = new Date(parsed.data.lastWorkingDate);
    if (parsed.data.reason !== undefined) data.reason = parsed.data.reason?.trim() || null;
    const item = await prisma.hrmResignation.update({
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
    await prisma.hrmResignation.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
