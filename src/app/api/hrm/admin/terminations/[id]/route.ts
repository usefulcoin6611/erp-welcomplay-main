import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  employeeId: z.string().min(1).optional(),
  terminationTypeId: z.string().min(1).optional(),
  noticeDate: z.string().min(1).optional(),
  terminationDate: z.string().min(1).optional(),
  description: z.string().optional(),
});

function toRow(t: {
  id: string;
  employeeId: string;
  terminationTypeId: string;
  noticeDate: Date;
  terminationDate: Date;
  description: string | null;
  employee: { name: string };
  terminationType: { name: string };
}) {
  return {
    id: t.id,
    employeeId: t.employeeId,
    employeeName: t.employee.name,
    terminationTypeId: t.terminationTypeId,
    terminationType: t.terminationType.name,
    noticeDate: t.noticeDate.toISOString().split("T")[0],
    terminationDate: t.terminationDate.toISOString().split("T")[0],
    description: t.description ?? "",
  };
}

export async function GET(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const item = await prisma.hrmTermination.findUnique({
      where: { id },
      include: {
        employee: { select: { name: true } },
        terminationType: { select: { name: true } },
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
    const existing = await prisma.hrmTermination.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    if (parsed.data.employeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
      if (!emp) return NextResponse.json({ success: false, message: "Employee not found" }, { status: 400 });
    }
    if (parsed.data.terminationTypeId) {
      const tt = await prisma.terminationType.findUnique({ where: { id: parsed.data.terminationTypeId } });
      if (!tt) return NextResponse.json({ success: false, message: "Termination type not found" }, { status: 400 });
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.employeeId) data.employeeId = parsed.data.employeeId;
    if (parsed.data.terminationTypeId) data.terminationTypeId = parsed.data.terminationTypeId;
    if (parsed.data.noticeDate) data.noticeDate = new Date(parsed.data.noticeDate);
    if (parsed.data.terminationDate) data.terminationDate = new Date(parsed.data.terminationDate);
    if (parsed.data.description !== undefined) data.description = parsed.data.description?.trim() || null;
    const item = await prisma.hrmTermination.update({
      where: { id },
      data,
      include: {
        employee: { select: { name: true } },
        terminationType: { select: { name: true } },
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
    await prisma.hrmTermination.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
