import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  employeeId: z.string().min(1).optional(),
  designationId: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  promotionDate: z.string().min(1).optional(),
  description: z.string().optional(),
});

function toRow(p: { id: string; employeeId: string; designationId: string | null; title: string; promotionDate: Date; description: string | null; employee: { name: string }; designation: { name: string } | null }) {
  return {
    id: p.id,
    employeeId: p.employeeId,
    employeeName: p.employee.name,
    designationId: p.designationId,
    designationName: p.designation?.name ?? "",
    title: p.title,
    promotionDate: p.promotionDate.toISOString().split("T")[0],
    description: p.description ?? "",
  };
}

export async function GET(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const item = await prisma.hrmPromotion.findUnique({
      where: { id },
      include: { employee: { select: { name: true } }, designation: { select: { name: true } } },
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
    const existing = await prisma.hrmPromotion.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    if (parsed.data.employeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
      if (!emp) return NextResponse.json({ success: false, message: "Employee not found" }, { status: 400 });
    }
    if (parsed.data.designationId) {
      const desig = await prisma.designation.findUnique({ where: { id: parsed.data.designationId } });
      if (!desig) return NextResponse.json({ success: false, message: "Designation not found" }, { status: 400 });
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.employeeId) data.employeeId = parsed.data.employeeId;
    if (parsed.data.designationId !== undefined) data.designationId = parsed.data.designationId;
    if (parsed.data.title) data.title = parsed.data.title;
    if (parsed.data.promotionDate) data.promotionDate = new Date(parsed.data.promotionDate);
    if (parsed.data.description !== undefined) data.description = parsed.data.description?.trim() || null;
    const item = await prisma.hrmPromotion.update({
      where: { id },
      data,
      include: { employee: { select: { name: true } }, designation: { select: { name: true } } },
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
    await prisma.hrmPromotion.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
