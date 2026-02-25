import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

function getGoalsDelegate() {
  const d = (prisma as Record<string, unknown>).performanceGoal as undefined | { findUnique: (a: unknown) => Promise<unknown>; update: (a: unknown) => Promise<unknown>; delete: (a: unknown) => Promise<unknown> };
  if (!d?.findUnique) return null;
  return d;
}

const updateSchema = z.object({
  goalTypeId: z.string().trim().min(1).optional(),
  subject: z.string().trim().min(1).optional(),
  branch: z.string().trim().min(1).optional(),
  targetAchievement: z.string().trim().min(1).optional(),
  startDate: z.string().trim().min(1).optional(),
  endDate: z.string().trim().min(1).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  progress: z.coerce.number().int().min(0).max(100).optional(),
});

function getGoalStatus(g: { startDate: Date; endDate: Date; progress: number }) {
  const today = new Date();
  if (g.progress >= 100) return "Completed";
  if (today < g.startDate) return "Planned";
  if (today > g.endDate) return "Overdue";
  return "In Progress";
}

function toResponse(g: {
  id: string;
  goalTypeId: string;
  subject: string;
  branch: string;
  targetAchievement: string;
  startDate: Date;
  endDate: Date;
  rating: number;
  progress: number;
  goalType?: { name: string };
}) {
  return {
    id: g.id,
    goalTypeId: g.goalTypeId,
    goalType: (g as any).goalType?.name ?? "",
    subject: g.subject,
    branch: g.branch,
    targetAchievement: g.targetAchievement,
    startDate: g.startDate.toISOString().split("T")[0],
    endDate: g.endDate.toISOString().split("T")[0],
    rating: g.rating,
    progress: g.progress,
    status: getGoalStatus(g),
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const delegate = getGoalsDelegate();
    if (!delegate) return NextResponse.json({ success: false, message: "Prisma client belum menyertakan performanceGoal. Restart dev server." }, { status: 503 });
    const { id } = await params;
    const item = await delegate.findUnique({ where: { id }, include: { goalType: { select: { name: true } } } });
    if (!item) return NextResponse.json({ success: false, message: "Goal tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true, data: toResponse(item as Parameters<typeof toResponse>[0]) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal memuat goal" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string })?.role;
    if (role !== "super admin" && role !== "company") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    const delegate = getGoalsDelegate();
    if (!delegate) return NextResponse.json({ success: false, message: "Prisma client belum menyertakan performanceGoal. Restart dev server." }, { status: 503 });
    const { id } = await params;
    const existing = await delegate.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Goal tidak ditemukan" }, { status: 404 });
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message ?? "Data tidak valid" }, { status: 400 });
    const data: Record<string, unknown> = { ...parsed.data };

    // Recompute effective dates for validation
    const current = existing as { startDate: Date; endDate: Date };
    const newStart =
      parsed.data.startDate != null ? new Date(parsed.data.startDate + "T00:00:00.000Z") : current.startDate;
    const newEnd = parsed.data.endDate != null ? new Date(parsed.data.endDate + "T00:00:00.000Z") : current.endDate;

    if (newEnd < newStart) {
      return NextResponse.json(
        { success: false, message: "End date tidak boleh lebih kecil dari start date" },
        { status: 400 },
      );
    }

    if (parsed.data.startDate != null) (data as Record<string, unknown>).startDate = newStart;
    if (parsed.data.endDate != null) (data as Record<string, unknown>).endDate = newEnd;
    const updated = await delegate.update({ where: { id }, data, include: { goalType: { select: { name: true } } } });
    return NextResponse.json({ success: true, message: "Goal berhasil diperbarui", data: toResponse(updated as Parameters<typeof toResponse>[0]) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal memperbarui goal" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string })?.role;
    if (role !== "super admin" && role !== "company") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    const delegate = getGoalsDelegate();
    if (!delegate) return NextResponse.json({ success: false, message: "Prisma client belum menyertakan performanceGoal. Restart dev server." }, { status: 503 });
    const { id } = await params;
    await delegate.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Goal berhasil dihapus" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal menghapus goal" }, { status: 500 });
  }
}
