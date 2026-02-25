import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  employeeId: z.string().trim().min(1),
  branch: z.string().trim().min(1),
  department: z.string().trim().min(1),
  designation: z.string().trim().min(1),
  targetRating: z.coerce.number().min(0).max(5),
  appraisalDate: z.string().trim().min(1),
  technicalRating: z.coerce.number().min(0).max(5).optional(),
  leadershipRating: z.coerce.number().min(0).max(5).optional(),
  teamworkRating: z.coerce.number().min(0).max(5).optional(),
  communicationRating: z.coerce.number().min(0).max(5).optional(),
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

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const list = await prisma.performanceAppraisal.findMany({
      orderBy: { appraisalDate: "desc" },
      include: { employee: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, data: list.map(toResponse) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal memuat appraisal" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string })?.role;
    if (role !== "super admin" && role !== "company") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message ?? "Data tidak valid" }, { status: 400 });
    const { technicalRating, leadershipRating, teamworkRating, communicationRating, appraisalDate, ...rest } = parsed.data;
    const appraisalDateObj = new Date(appraisalDate + "T00:00:00.000Z");

    // Prevent multiple appraisals for the same employee in the same half-year period
    const startOfHalf =
      appraisalDateObj.getUTCMonth() < 6
        ? new Date(Date.UTC(appraisalDateObj.getUTCFullYear(), 0, 1))
        : new Date(Date.UTC(appraisalDateObj.getUTCFullYear(), 6, 1));
    const startOfNextHalf =
      appraisalDateObj.getUTCMonth() < 6
        ? new Date(Date.UTC(appraisalDateObj.getUTCFullYear(), 6, 1))
        : new Date(Date.UTC(appraisalDateObj.getUTCFullYear() + 1, 0, 1));

    const duplicate = await prisma.performanceAppraisal.findFirst({
      where: {
        employeeId: rest.employeeId,
        appraisalDate: {
          gte: startOfHalf,
          lt: startOfNextHalf,
        },
      },
    });
    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message: `Appraisal untuk karyawan ini pada periode ${getHalfYearLabel(appraisalDateObj)} sudah ada`,
        },
        { status: 409 }
      );
    }
    const ratings = [technicalRating, leadershipRating, teamworkRating, communicationRating].filter((r): r is number => r != null);
    const overallRating = ratings.length > 0 ? ratings.reduce((s, r) => s + r, 0) / ratings.length : rest.targetRating;
    const created = await prisma.performanceAppraisal.create({
      data: {
        ...rest,
        appraisalDate: appraisalDateObj,
        technicalRating: technicalRating ?? null,
        leadershipRating: leadershipRating ?? null,
        teamworkRating: teamworkRating ?? null,
        communicationRating: communicationRating ?? null,
        overallRating: Math.round(overallRating * 10) / 10,
      },
      include: { employee: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, message: "Appraisal berhasil dibuat", data: toResponse(created) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal membuat appraisal" }, { status: 500 });
  }
}
