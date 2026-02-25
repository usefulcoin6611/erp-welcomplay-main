import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createOnboardingSchema = z.object({
  applicationId: z.string().trim().min(1, "Application wajib dipilih"),
});

function toDateOnlyString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type ObWithRelations = {
  id: string;
  applicationId: string;
  employeeId: string | null;
  status: string;
  onboardingDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  application: {
    id: string;
    applicantName: string;
    email: string;
    job: { id: string; title: string };
    stage: { name: string };
  };
  employee: { id: string; name: string; employeeId: string } | null;
};

function onboardingToResponse(ob: ObWithRelations) {
  return {
    id: ob.id,
    applicationId: ob.applicationId,
    application: {
      id: ob.application.id,
      applicantName: ob.application.applicantName,
      email: ob.application.email,
      jobId: ob.application.job.id,
      jobTitle: ob.application.job.title,
      stage: ob.application.stage.name,
    },
    employeeId: ob.employeeId ?? undefined,
    employee: ob.employee
      ? { id: ob.employee.id, name: ob.employee.name, employeeId: ob.employee.employeeId }
      : undefined,
    status: ob.status,
    onboardingDate: ob.onboardingDate ? toDateOnlyString(ob.onboardingDate) : undefined,
    completedAt: ob.completedAt ? toDateOnlyString(ob.completedAt) : undefined,
    createdAt: toDateOnlyString(ob.createdAt),
    updatedAt: toDateOnlyString(ob.updatedAt),
  };
}

async function getHiredStageId(): Promise<string | null> {
  const stage = await prisma.jobStage.findFirst({
    where: { name: "Hired" },
    select: { id: true },
  });
  return stage?.id ?? null;
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
    const applicationId = searchParams.get("applicationId");
    const status = searchParams.get("status");

    const where: { applicationId?: string; status?: string } = {};
    if (applicationId) where.applicationId = applicationId;
    if (status) where.status = status;

    const list = await prisma.jobOnboarding.findMany({
      where: Object.keys(where).length ? where : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        application: {
          include: {
            job: { select: { id: true, title: true } },
            stage: { select: { name: true } },
          },
        },
        employee: { select: { id: true, name: true, employeeId: true } },
      },
    });

    const data = list.map((ob) => onboardingToResponse(ob as ObWithRelations));

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error fetching onboarding list:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data onboarding" },
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
    const parsed = createOnboardingSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Data tidak valid";
      return NextResponse.json(
        { success: false, message: msg, errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { applicationId } = parsed.data;

    const hiredStageId = await getHiredStageId();
    if (!hiredStageId) {
      return NextResponse.json(
        { success: false, message: "Stage 'Hired' tidak ditemukan. Jalankan seed job stages." },
        { status: 400 },
      );
    }

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { stage: { select: { id: true, name: true } }, job: { select: { id: true, title: true } } },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Lamaran tidak ditemukan" },
        { status: 404 },
      );
    }

    if (application.stageId !== hiredStageId) {
      return NextResponse.json(
        { success: false, message: "Hanya lamaran dengan stage 'Hired' yang dapat dibuatkan onboarding" },
        { status: 400 },
      );
    }

    const existing = await prisma.jobOnboarding.findUnique({
      where: { applicationId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Onboarding untuk lamaran ini sudah ada" },
        { status: 400 },
      );
    }

    const onboarding = await prisma.jobOnboarding.create({
      data: {
        applicationId,
        status: "pending",
      },
      include: {
        application: {
          include: {
            job: { select: { id: true, title: true } },
            stage: { select: { name: true } },
          },
        },
        employee: { select: { id: true, name: true, employeeId: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding berhasil dibuat",
      data: onboardingToResponse(onboarding as ObWithRelations),
    });
  } catch (error: unknown) {
    console.error("Error creating onboarding:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat onboarding" },
      { status: 500 },
    );
  }
}
