import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateJobSchema = z.object({
  title: z.string().trim().min(1).optional(),
  branchId: z.string().trim().min(1).optional(),
  jobCategoryId: z.string().trim().min(1).optional(),
  positions: z.coerce.number().int().min(1).optional(),
  status: z.enum(["active", "in_active"]).optional(),
  startDate: z.string().trim().min(1).optional(),
  endDate: z.string().trim().min(1).optional(),
  description: z.string().trim().optional().nullable(),
  requirement: z.string().trim().optional().nullable(),
  skill: z.array(z.string()).optional().nullable(),
  applicant: z.array(z.string()).optional().nullable(),
  visibility: z.array(z.string()).optional().nullable(),
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        branch: { select: { name: true } },
        jobCategory: { select: { name: true } },
        jobQuestions: { include: { question: { select: { id: true, question: true } } } },
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: jobToResponse(job) });
  } catch (error: unknown) {
    console.error("Error fetching recruitment job:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat job" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;
    const existing = await prisma.job.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Job tidak ditemukan" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateJobSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Data tidak valid";
      return NextResponse.json(
        { success: false, message: msg, errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data: Record<string, unknown> = {};

    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.branchId !== undefined) {
      const branch = await prisma.branch.findUnique({ where: { id: parsed.data.branchId } });
      if (!branch) {
        return NextResponse.json(
          { success: false, message: "Branch tidak ditemukan" },
          { status: 400 },
        );
      }
      data.branchId = parsed.data.branchId;
    }
    if (parsed.data.jobCategoryId !== undefined) {
      const cat = await prisma.jobCategory.findUnique({ where: { id: parsed.data.jobCategoryId } });
      if (!cat) {
        return NextResponse.json(
          { success: false, message: "Job category tidak ditemukan" },
          { status: 400 },
        );
      }
      data.jobCategoryId = parsed.data.jobCategoryId;
    }
    if (parsed.data.positions !== undefined) data.positions = parsed.data.positions;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.description !== undefined) data.description = parsed.data.description;
    if (parsed.data.requirement !== undefined) data.requirement = parsed.data.requirement;
    if (parsed.data.skill !== undefined) data.skill = parsed.data.skill;
    if (parsed.data.applicant !== undefined) data.applicant = parsed.data.applicant;
    if (parsed.data.visibility !== undefined) data.visibility = parsed.data.visibility;

    if (parsed.data.startDate !== undefined) {
      const start = new Date(`${parsed.data.startDate}T00:00:00.000Z`);
      if (Number.isNaN(start.getTime())) {
        return NextResponse.json(
          { success: false, message: "Format start date tidak valid" },
          { status: 400 },
        );
      }
      data.startDate = start;
    }
    if (parsed.data.endDate !== undefined) {
      const end = new Date(`${parsed.data.endDate}T00:00:00.000Z`);
      if (Number.isNaN(end.getTime())) {
        return NextResponse.json(
          { success: false, message: "Format end date tidak valid" },
          { status: 400 },
        );
      }
      data.endDate = end;
    }

    const questionIds = parsed.data.questionIds;
    if (questionIds !== undefined) {
      if (questionIds.length > 0) {
        const questions = await prisma.recruitmentQuestion.findMany({
          where: { id: { in: questionIds } },
          select: { id: true },
        });
        if (questions.length !== questionIds.length) {
          return NextResponse.json(
            { success: false, message: "Beberapa custom question tidak ditemukan" },
            { status: 400 },
          );
        }
      }
      await prisma.jobQuestion.deleteMany({ where: { jobId: id } });
      if (questionIds.length > 0) {
        await prisma.jobQuestion.createMany({
          data: questionIds.map((qid, idx) => ({
            jobId: id,
            questionId: qid,
            order: idx,
          })),
        });
      }
    }

    const job = await prisma.job.update({
      where: { id },
      data,
      include: {
        branch: { select: { name: true } },
        jobCategory: { select: { name: true } },
        jobQuestions: { include: { question: { select: { id: true, question: true } } } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Job berhasil diperbarui",
      data: jobToResponse(job),
    });
  } catch (error: unknown) {
    console.error("Error updating recruitment job:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui job" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

    const { id } = await params;

    await prisma.job.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Job berhasil dihapus",
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Job tidak ditemukan" },
        { status: 404 },
      );
    }
    console.error("Error deleting recruitment job:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus job" },
      { status: 500 },
    );
  }
}
