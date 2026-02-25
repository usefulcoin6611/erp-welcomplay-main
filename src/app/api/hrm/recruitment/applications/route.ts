import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createApplicationSchema = z.object({
  jobId: z.string().trim().min(1, "Job wajib dipilih"),
  stageId: z.string().trim().min(1, "Stage wajib dipilih"),
  applicantName: z.string().trim().min(1, "Nama applicant wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().trim().min(1, "Nomor telepon wajib diisi"),
  appliedDate: z.string().trim().min(1, "Tanggal lamaran wajib diisi"),
  rating: z.coerce.number().int().min(0).max(5).default(0),
  resume: z.string().trim().optional(),
  coverLetter: z.string().trim().optional(),
  dob: z.string().trim().optional(),
  gender: z.string().trim().optional(),
  country: z.string().trim().optional(),
  state: z.string().trim().optional(),
  city: z.string().trim().optional(),
  profile: z.string().trim().optional(),
  skill: z.string().trim().optional(),
  customQuestion: z.record(z.string()).optional(),
});

function toDateOnlyString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function applicationToResponse(app: {
  id: string;
  jobId: string;
  stageId: string;
  applicantName: string;
  email: string;
  phone: string;
  appliedDate: Date;
  rating: number;
  resume: string | null;
  coverLetter: string | null;
  isArchive: boolean;
  dob: string | null;
  gender: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  profile: string | null;
  skill: string | null;
  customQuestion: unknown;
  notes: unknown;
  job: { title: string };
  stage: { name: string };
}) {
  const notesArr = Array.isArray(app.notes) ? app.notes : [];
  const customQ = app.customQuestion && typeof app.customQuestion === "object" ? (app.customQuestion as Record<string, string>) : undefined;
  return {
    id: app.id,
    jobId: app.jobId,
    jobTitle: app.job.title,
    stageId: app.stageId,
    stage: app.stage.name,
    applicantName: app.applicantName,
    email: app.email,
    phone: app.phone,
    appliedDate: toDateOnlyString(app.appliedDate),
    rating: app.rating,
    resume: app.resume ?? undefined,
    coverLetter: app.coverLetter ?? undefined,
    isArchive: app.isArchive,
    dob: app.dob ?? undefined,
    gender: app.gender ?? undefined,
    country: app.country ?? undefined,
    state: app.state ?? undefined,
    city: app.city ?? undefined,
    profile: app.profile ?? undefined,
    skill: app.skill ?? undefined,
    customQuestion: customQ,
    notes: notesArr as { id: string; note: string; createdAt: string; noteCreatedName: string }[],
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const stageId = searchParams.get("stageId");
    const isArchive = searchParams.get("isArchive");

    const where: { jobId?: string; stageId?: string; isArchive?: boolean } = {};
    if (jobId) where.jobId = jobId;
    if (stageId) where.stageId = stageId;
    if (isArchive !== null && isArchive !== undefined && isArchive !== "") {
      where.isArchive = isArchive === "true";
    }

    const applications = await prisma.jobApplication.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { appliedDate: "desc" },
      include: {
        job: { select: { title: true } },
        stage: { select: { name: true } },
      },
    });

    const data = applications.map(applicationToResponse);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error fetching recruitment applications:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data lamaran" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== "super admin" && userRole !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = createApplicationSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Data tidak valid";
      return NextResponse.json(
        { success: false, message: msg, errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { jobId, stageId, appliedDate, ...rest } = parsed.data;
    const appliedDateObj = new Date(`${appliedDate}T00:00:00.000Z`);
    if (Number.isNaN(appliedDateObj.getTime())) {
      return NextResponse.json(
        { success: false, message: "Format tanggal lamaran tidak valid" },
        { status: 400 },
      );
    }

    const [job, stage] = await Promise.all([
      prisma.job.findUnique({ where: { id: jobId } }),
      prisma.jobStage.findUnique({ where: { id: stageId } }),
    ]);

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job tidak ditemukan" },
        { status: 400 },
      );
    }
    if (!stage) {
      return NextResponse.json(
        { success: false, message: "Job stage tidak ditemukan" },
        { status: 400 },
      );
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        stageId,
        appliedDate: appliedDateObj,
        applicantName: rest.applicantName,
        email: rest.email,
        phone: rest.phone,
        rating: rest.rating,
        resume: rest.resume ?? null,
        coverLetter: rest.coverLetter ?? null,
        dob: rest.dob ?? null,
        gender: rest.gender ?? null,
        country: rest.country ?? null,
        state: rest.state ?? null,
        city: rest.city ?? null,
        profile: rest.profile ?? null,
        skill: rest.skill ?? null,
        customQuestion: rest.customQuestion ?? null,
      },
      include: {
        job: { select: { title: true } },
        stage: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lamaran berhasil ditambahkan",
      data: applicationToResponse(application),
    });
  } catch (error: unknown) {
    console.error("Error creating recruitment application:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambah lamaran" },
      { status: 500 },
    );
  }
}
