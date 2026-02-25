import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  branch: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional(),
  description: z.string().optional(),
});

function toRow(a: { id: string; title: string; branch: string; department: string; startDate: Date; endDate: Date; description: string | null }) {
  const status = new Date(a.endDate) >= new Date() ? "Active" : "Expired";
  return {
    id: a.id,
    title: a.title,
    branch: a.branch,
    department: a.department,
    startDate: a.startDate.toISOString().split("T")[0],
    endDate: a.endDate.toISOString().split("T")[0],
    description: a.description ?? "",
    status,
  };
}

export async function GET(_r: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const item = await prisma.hrmAnnouncement.findUnique({ where: { id } });
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
    const existing = await prisma.hrmAnnouncement.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    const data: Record<string, unknown> = {};
    if (parsed.data.title) data.title = parsed.data.title;
    if (parsed.data.branch) data.branch = parsed.data.branch;
    if (parsed.data.department) data.department = parsed.data.department;
    if (parsed.data.startDate) data.startDate = new Date(parsed.data.startDate);
    if (parsed.data.endDate) data.endDate = new Date(parsed.data.endDate);
    if (parsed.data.description !== undefined) data.description = parsed.data.description?.trim() || null;
    const item = await prisma.hrmAnnouncement.update({ where: { id }, data });
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
    await prisma.hrmAnnouncement.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 500 });
  }
}
