import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  goalTypeId: z.string().trim().min(1),
  subject: z.string().trim().min(1),
  branch: z.string().trim().min(1),
  targetAchievement: z.string().trim().min(1),
  startDate: z.string().trim().min(1),
  endDate: z.string().trim().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  progress: z.coerce.number().int().min(0).max(100),
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
    goalType: (g as { goalType?: { name: string } }).goalType?.name ?? "",
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

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as { role?: string; branchId?: string };
    const delegate = (prisma as Record<string, unknown>).performanceGoal as undefined | { findMany: (args: unknown) => Promise<unknown[]> };
    if (!delegate?.findMany) {
      return NextResponse.json(
        { success: false, message: "Prisma client belum menyertakan performanceGoal. Jalankan: pnpm prisma generate, lalu restart dev server." },
        { status: 503 }
      );
    }
    const where: Record<string, unknown> = {};

    // Multi-tenancy: non super admin/company only see their own branch
    if (user.role !== "super admin" && user.role !== "company" && user.branchId) {
      const userBranch = await prisma.branch.findUnique({ where: { id: user.branchId } });
      if (userBranch) {
        where.branch = userBranch.name;
      }
    }

    const list = (await delegate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { goalType: { select: { name: true } } },
    })) as Parameters<typeof toResponse>[0][];
    return NextResponse.json({ success: true, data: list.map(toResponse) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal memuat goal" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = session.user as { role?: string; branchId?: string };
    const role = user?.role;
    if (role !== "super admin" && role !== "company") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    const delegate = (prisma as Record<string, unknown>).performanceGoal as undefined | { create: (args: unknown) => Promise<unknown> };
    if (!delegate?.create) {
      return NextResponse.json(
        { success: false, message: "Prisma client belum menyertakan performanceGoal. Jalankan: pnpm prisma generate, lalu restart dev server." },
        { status: 503 }
      );
    }
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message ?? "Data tidak valid" }, { status: 400 });
    const { startDate, endDate, ...rest } = parsed.data;

    const start = new Date(startDate + "T00:00:00.000Z");
    const end = new Date(endDate + "T00:00:00.000Z");
    if (end < start) {
      return NextResponse.json(
        { success: false, message: "End date tidak boleh lebih kecil dari start date" },
        { status: 400 },
      );
    }

    let branchName = rest.branch;
    // Enforce branch from session for non super admin/company
    if (user.role !== "super admin" && user.role !== "company" && user.branchId) {
      const userBranch = await prisma.branch.findUnique({ where: { id: user.branchId } });
      if (userBranch) {
        branchName = userBranch.name;
      }
    }

    const created = await delegate.create({
      data: { ...rest, branch: branchName, startDate: start, endDate: end },
      include: { goalType: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, message: "Goal berhasil dibuat", data: toResponse(created as Parameters<typeof toResponse>[0]) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal membuat goal" }, { status: 500 });
  }
}
