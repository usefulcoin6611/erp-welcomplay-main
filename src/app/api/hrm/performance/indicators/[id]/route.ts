import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  branch: z.string().trim().min(1).optional(),
  department: z.string().trim().min(1).optional(),
  designation: z.string().trim().min(1).optional(),
  technicalRating: z.coerce.number().min(0).max(5).optional(),
  organizationalRating: z.coerce.number().min(0).max(5).optional(),
  customerExperienceRating: z.coerce.number().min(0).max(5).optional(),
  addedBy: z.string().trim().optional(),
  periodYear: z.coerce.number().int().min(2000).max(2100).optional(),
  periodQuarter: z.coerce.number().int().min(1).max(4).optional(),
});

type IndicatorRow = {
  id: string;
  branch: string;
  department: string;
  designation: string;
  overallRating: number;
  addedBy: string;
  createdAt: Date;
  periodYear: number | null;
  periodQuarter: number | null;
};

function toResponse(ind: IndicatorRow) {
  return {
    id: ind.id,
    branch: ind.branch,
    department: ind.department,
    designation: ind.designation,
    overallRating: ind.overallRating,
    addedBy: ind.addedBy,
    createdAt: ind.createdAt.toISOString().split("T")[0],
    periodYear: ind.periodYear ?? null,
    periodQuarter: ind.periodQuarter ?? null,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const item = await prisma.performanceIndicator.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ success: false, message: "Indikator tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true, data: toResponse(item as IndicatorRow) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal memuat indikator" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string })?.role;
    if (role !== "super admin" && role !== "company")
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const existing = await prisma.performanceIndicator.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, message: "Indikator tidak ditemukan" }, { status: 404 });

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Data tidak valid";
      return NextResponse.json({ success: false, message: msg }, { status: 400 });
    }

    type UpdateData = {
      branch?: string;
      department?: string;
      designation?: string;
      technicalRating?: number;
      organizationalRating?: number;
      customerExperienceRating?: number;
      addedBy?: string;
      overallRating?: number;
      periodYear?: number | null;
      periodQuarter?: number | null;
    };
    const data: UpdateData = { ...parsed.data };
    if (
      parsed.data.technicalRating !== undefined ||
      parsed.data.organizationalRating !== undefined ||
      parsed.data.customerExperienceRating !== undefined
    ) {
      const t = parsed.data.technicalRating ?? existing.technicalRating;
      const o = parsed.data.organizationalRating ?? existing.organizationalRating;
      const c = parsed.data.customerExperienceRating ?? existing.customerExperienceRating;
      data.overallRating = Math.round(((t + o + c) / 3) * 10) / 10;
    }

    const updated = (await prisma.performanceIndicator.update({
      where: { id },
      data,
    })) as IndicatorRow;
    return NextResponse.json({
      success: true,
      message: "Indikator berhasil diperbarui",
      data: toResponse(updated),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal memperbarui indikator" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string })?.role;
    if (role !== "super admin" && role !== "company")
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await prisma.performanceIndicator.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Indikator berhasil dihapus" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal menghapus indikator" }, { status: 500 });
  }
}
