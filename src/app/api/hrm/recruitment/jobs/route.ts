import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createJobSchema = z.object({
  title: z.string().trim().min(1, "Job title wajib diisi"),
  branchId: z.string().trim().min(1, "Branch wajib dipilih"),
  jobCategoryId: z.string().trim().min(1, "Job category wajib dipilih"),
  positions: z.coerce.number().int().min(1, "Positions minimal 1"),
  status: z.enum(["active", "in_active"]).default("active"),
  startDate: z.string().trim().min(1, "Start date wajib diisi"),
  endDate: z.string().trim().min(1, "End date wajib diisi"),
  description: z.string().trim().optional(),
  requirement: z.string().trim().optional(),
  skill: z.array(z.string()).optional(),
  applicant: z.array(z.string()).optional(),
  visibility: z.array(z.string()).optional(),
  questionIds: z.array(z.string()).optional(),
});

function toDateOnlyString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function jobToResponse(job: {
  id: string;
  title: string;
  branchId: string;
  jobCategoryId: string;
  positions: number;
  status: string;
  startDate: Date;
  endDate: Date;
  description: string | null;
  requirement: string | null;
  skill: unknown;
  applicant: unknown;
  visibility: unknown;
  createdAt: Date;
  branch: { name: string };
  jobCategory: { name: string };
  jobQuestions: { question: { id: string; question: string } }[];
}) {
  const skillArr = Array.isArray(job.skill) ? job.skill : [];
  return {
    id: job.id,
    title: job.title,
    branch: job.branch.name,
    branchId: job.branchId,
    category: job.jobCategory.name,
    jobCategoryId: job.jobCategoryId,
    positions: job.positions,
    status: job.status as "active" | "in_active",
    startDate: toDateOnlyString(job.startDate),
    endDate: toDateOnlyString(job.endDate),
    createdAt: toDateOnlyString(job.createdAt),
    description: job.description ?? undefined,
    requirement: job.requirement ?? undefined,
    skill: skillArr as string[],
    applicant: (Array.isArray(job.applicant) ? job.applicant : []) as string[],
    visibility: (Array.isArray(job.visibility) ? job.visibility : []) as string[],
    customQuestionTitles: job.jobQuestions
      .sort((a, b) => a.question.id.localeCompare(b.question.id))
      .map((jq) => jq.question.question),
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
    const statusFilter = searchParams.get("status");

    const jobs = await prisma.job.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        branch: { select: { name: true } },
        jobCategory: { select: { name: true } },
        jobQuestions: { include: { question: { select: { id: true, question: true } } } },
      },
    });

    const data = jobs.map(jobToResponse);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error fetching recruitment jobs:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data job" },
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
    const parsed = createJobSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Data tidak valid";
      return NextResponse.json(
        { success: false, message: msg, errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const {
      title,
      branchId,
      jobCategoryId,
      positions,
      status,
      startDate,
      endDate,
      description,
      requirement,
      skill,
      applicant,
      visibility,
      questionIds,
    } = parsed.data;

    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, message: "Format tanggal tidak valid" },
        { status: 400 },
      );
    }
    if (end < start) {
      return NextResponse.json(
        { success: false, message: "End date tidak boleh sebelum start date" },
        { status: 400 },
      );
    }

    const [branch, category] = await Promise.all([
      prisma.branch.findUnique({ where: { id: branchId } }),
      prisma.jobCategory.findUnique({ where: { id: jobCategoryId } }),
    ]);

    if (!branch) {
      return NextResponse.json(
        { success: false, message: "Branch tidak ditemukan" },
        { status: 400 },
      );
    }
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Job category tidak ditemukan" },
        { status: 400 },
      );
    }

    const questionIdList = Array.isArray(questionIds) ? questionIds : [];
    if (questionIdList.length > 0) {
      const questions = await prisma.recruitmentQuestion.findMany({
        where: { id: { in: questionIdList } },
        select: { id: true },
      });
      if (questions.length !== questionIdList.length) {
        return NextResponse.json(
          { success: false, message: "Beberapa custom question tidak ditemukan" },
          { status: 400 },
        );
      }
    }

    const job = await prisma.job.create({
      data: {
        title,
        branchId,
        jobCategoryId,
        positions,
        status,
        startDate: start,
        endDate: end,
        description: description || null,
        requirement: requirement || null,
        skill: skill ?? null,
        applicant: applicant ?? null,
        visibility: visibility ?? null,
        jobQuestions:
          questionIdList.length > 0
            ? {
                create: questionIdList.map((qid, idx) => ({
                  questionId: qid,
                  order: idx,
                })),
              }
            : undefined,
      },
      include: {
        branch: { select: { name: true } },
        jobCategory: { select: { name: true } },
        jobQuestions: { include: { question: { select: { id: true, question: true } } } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Job berhasil dibuat",
      data: jobToResponse(job),
    });
  } catch (error: unknown) {
    console.error("Error creating recruitment job:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat job" },
      { status: 500 },
    );
  }
}
