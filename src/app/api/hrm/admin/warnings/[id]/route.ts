import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  employeeId: z.string().min(1).optional(),
  warningById: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  warningDate: z.string().min(1).optional(),
  description: z.string().optional(),
});

function toRow(w: {
  id: string;
  employeeId: string;
  warningById: string;
  subject: string;
  warningDate: Date;
  description: string | null;
  employee: { name: string };
  warningBy: { name: string };
}) {
  return {
    id: w.id,
    employeeId: w.employeeId,
    employeeName: w.employee.name,
    warningById: w.warningById,
    warningBy: w.warningBy.name,
    subject: w.subject,
    warningDate: w.warningDate.toISOString().split("T")[0],
    description: w.description ?? "",
  };
}

export async function GET(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const item = await prisma.hrmWarning.findUnique({
      where: { id },
      include: {
        employee: { select: { name: true } },
        warningBy: { select: { name: true } },
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
    const existing = await prisma.hrmWarning.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    if (parsed.data.employeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
      if (!emp) return NextResponse.json({ success: false, message: "Employee not found" }, { status: 400 });
    }
    if (parsed.data.warningById) {
      const wb = await prisma.employee.findUnique({ where: { id: parsed.data.warningById } });
      if (!wb) return NextResponse.json({ success: false, message: "Warning by (employee) not found" }, { status: 400 });
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.employeeId) data.employeeId = parsed.data.employeeId;
    if (parsed.data.warningById) data.warningById = parsed.data.warningById;
    if (parsed.data.subject) data.subject = parsed.data.subject;
    if (parsed.data.warningDate) data.warningDate = new Date(parsed.data.warningDate);
    if (parsed.data.description !== undefined) data.description = parsed.data.description?.trim() || null;
    const item = await prisma.hrmWarning.update({
      where: { id },
      data,
      include: {
        employee: { select: { name: true } },
        warningBy: { select: { name: true } },
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
    await prisma.hrmWarning.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
