import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  branch: z.string().trim().min(1),
  department: z.string().trim().min(1),
  designation: z.string().trim().min(1),
  technicalRating: z.coerce.number().min(0).max(5),
  organizationalRating: z.coerce.number().min(0).max(5),
  customerExperienceRating: z.coerce.number().min(0).max(5),
  addedBy: z.string().trim().optional().default(""),
  periodYear: z.coerce.number().int().min(2000).max(2100),
  periodQuarter: z.coerce.number().int().min(1).max(4),
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

type UsageRow = {
  branch: string;
  department: string;
  designation: string;
  _count: { _all: number };
  _avg: { overallRating: number | null };
};

function buildUsageMap(rows: UsageRow[]) {
  const map = new Map<string, UsageRow>();
  for (const r of rows) {
    const key = `${r.branch}::${r.department}::${r.designation}`;
    map.set(key, r);
  }
  return map;
}

function toResponse(ind: IndicatorRow, usage?: UsageRow) {
  const keyData = {
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

  if (!usage) {
    return { ...keyData, appraisalCount: 0, avgAppraisalRating: null as number | null };
  }

  return {
    ...keyData,
    appraisalCount: usage._count._all,
    avgAppraisalRating: usage._avg.overallRating,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as { role?: string; branchId?: string };
    const url = new URL(request.url);
    const yearParam = url.searchParams.get("year");
    const quarterParam = url.searchParams.get("quarter");

    const { id: userId, role, ownerId: sessionOwnerId } = session.user as any;
    const companyId = role === "company" ? userId : sessionOwnerId;

    const where: any = {
      ownerId: companyId,
    };

    if (yearParam) {
      const year = Number(yearParam);
      if (!Number.isNaN(year)) {
        where.periodYear = year;
      }
    }
    if (quarterParam) {
      const q = Number(quarterParam);
      if (!Number.isNaN(q)) {
        where.periodQuarter = q;
      }
    }

    const list = (await prisma.performanceIndicator.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })) as IndicatorRow[];

    // Hitung keterkaitan ke appraisal (usage) per branch+department+designation
    const usageWhere: Record<string, unknown> = {};
    if (where.branch) {
      usageWhere.branch = where.branch;
    }
    const usageGroup = (await prisma.performanceAppraisal.groupBy({
      by: ["branch", "department", "designation"],
      _count: { _all: true },
      _avg: { overallRating: true },
      where: usageWhere,
    })) as UsageRow[];
    const usageMap = buildUsageMap(usageGroup);

    const data = list.map((ind) => {
      const key = `${ind.branch}::${ind.department}::${ind.designation}`;
      const usage = usageMap.get(key);
      return toResponse(ind, usage);
    });

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal memuat indikator" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role, ownerId: sessionOwnerId } = session.user as any;
    if (role !== "super admin" && role !== "company")
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

    const companyId = role === "company" ? userId : sessionOwnerId;

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    const {
      technicalRating,
      organizationalRating,
      customerExperienceRating,
      periodYear,
      periodQuarter,
      ...rest
    } = parsed.data;

    // Unik per (branch + department + designation + periode + ownerId)
    const existing = await prisma.performanceIndicator.findFirst({
      where: {
        branch: rest.branch,
        department: rest.department,
        designation: rest.designation,
        periodYear,
        periodQuarter,
        ownerId: companyId,
      },
    });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Indikator untuk kombinasi branch/department/designation dan periode ini sudah ada",
        },
        { status: 409 }
      );
    }

    const overallRating = (technicalRating + organizationalRating + customerExperienceRating) / 3;
    const created = (await prisma.performanceIndicator.create({
      data: {
        ...rest,
        technicalRating,
        organizationalRating,
        customerExperienceRating,
        overallRating: Math.round(overallRating * 10) / 10,
        periodYear,
        periodQuarter,
        ownerId: companyId,
      },
    })) as IndicatorRow;

    // Usage awal tentu masih 0
    return NextResponse.json({
      success: true,
      message: "Indikator berhasil dibuat",
      data: toResponse(created),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal membuat indikator" }, { status: 500 });
  }
}
