import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  employeeId: z.string().trim().min(1).optional(),
  branch: z.string().trim().min(1).optional(),
  department: z.string().trim().min(1).optional(),
  designation: z.string().trim().min(1).optional(),
  targetRating: z.coerce.number().min(0).max(5).optional(),
  appraisalDate: z.string().trim().min(1).optional(),
  technicalRating: z.coerce.number().min(0).max(5).optional().nullable(),
  leadershipRating: z.coerce.number().min(0).max(5).optional().nullable(),
  teamworkRating: z.coerce.number().min(0).max(5).optional().nullable(),
  communicationRating: z.coerce.number().min(0).max(5).optional().nullable(),
  remarks: z.string().trim().optional().nullable(),
});

function getHalfYearLabel(date: Date) {
  const year = date.getUTCFullYear();
  const half = date.getUTCMonth() < 6 ? "H1" : "H2";
  return `${year} ${half}`;
}

function toResponse(a: { id: string; employeeId: string; branch: string; department: string; designation: string; targetRating: number; overallRating: number; appraisalDate: Date; employee?: { name: string } }) {
  return {
    id: a.id,
    employeeId: a.employeeId,
    employee: (a as { employee?: { name: string } }).employee?.name ?? "",
    branch: a.branch,
    department: a.department,
    designation: a.designation,
    targetRating: a.targetRating,
    overallRating: a.overallRating,
    appraisalDate: a.appraisalDate.toISOString().split("T")[0],
    period: getHalfYearLabel(a.appraisalDate),
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const item = await prisma.performanceAppraisal.findUnique({ where: { id }, include: { employee: { select: { name: true } } } });
    if (!item) return NextResponse.json({ success: false, message: "Appraisal tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true, data: toResponse(item) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal memuat appraisal" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string })?.role;
    if (role !== "super admin" && role !== "company") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const existing = await prisma.performanceAppraisal.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Appraisal tidak ditemukan" }, { status: 404 });
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message ?? "Data tidak valid" }, { status: 400 });
    const data: Record<string, unknown> = { ...parsed.data };
    let effectiveEmployeeId = parsed.data.employeeId ?? existing.employeeId;
    let effectiveAppraisalDate = existing.appraisalDate;

    if (parsed.data.appraisalDate != null) {
      effectiveAppraisalDate = new Date(parsed.data.appraisalDate + "T00:00:00.000Z");
      (data as Record<string, unknown>).appraisalDate = effectiveAppraisalDate;
    }

    // Prevent multiple appraisals for same employee and half-year period on update
    const startOfHalf =
      effectiveAppraisalDate.getUTCMonth() < 6
        ? new Date(Date.UTC(effectiveAppraisalDate.getUTCFullYear(), 0, 1))
        : new Date(Date.UTC(effectiveAppraisalDate.getUTCFullYear(), 6, 1));
    const startOfNextHalf =
      effectiveAppraisalDate.getUTCMonth() < 6
        ? new Date(Date.UTC(effectiveAppraisalDate.getUTCFullYear(), 6, 1))
        : new Date(Date.UTC(effectiveAppraisalDate.getUTCFullYear() + 1, 0, 1));

    const duplicate = await prisma.performanceAppraisal.findFirst({
      where: {
        employeeId: effectiveEmployeeId,
        appraisalDate: {
          gte: startOfHalf,
          lt: startOfNextHalf,
        },
        NOT: { id },
      },
    });
    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: `Appraisal untuk karyawan ini pada periode ${getHalfYearLabel(effectiveAppraisalDate)} sudah ada`,
        },
        { status: 409 }
      );
    }
    const t = parsed.data.technicalRating ?? existing.technicalRating;
    const l = parsed.data.leadershipRating ?? existing.leadershipRating;
    const tw = parsed.data.teamworkRating ?? existing.teamworkRating;
    const c = parsed.data.communicationRating ?? existing.communicationRating;
    const arr = [t, l, tw, c].filter((x): x is number => x != null);
    if (arr.length) (data as Record<string, unknown>).overallRating = Math.round((arr.reduce((s, x) => s + x, 0) / arr.length) * 10) / 10;
    const updated = await prisma.performanceAppraisal.update({ where: { id }, data: data as object, include: { employee: { select: { name: true } } } });
    return NextResponse.json({ success: true, message: "Appraisal berhasil diperbarui", data: toResponse(updated) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal memperbarui appraisal" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string })?.role;
    if (role !== "super admin" && role !== "company") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    const { id } = await params;
    await prisma.performanceAppraisal.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Appraisal berhasil dihapus" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal menghapus appraisal" }, { status: 500 });
  }
}
