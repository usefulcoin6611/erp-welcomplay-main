import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateOnboardingSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed", "converted"]).optional(),
  employeeId: z.string().trim().optional().nullable(),
  onboardingDate: z.string().trim().optional().nullable(),
  completedAt: z.string().trim().optional().nullable(),
});

function toDateOnlyString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function onboardingToResponse(ob: {
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
}) {
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

    const onboarding = await prisma.jobOnboarding.findUnique({
      where: { id },
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

    if (!onboarding) {
      return NextResponse.json(
        { success: false, message: "Onboarding tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: onboardingToResponse({
        ...onboarding,
        application: {
          id: onboarding.application.id,
          applicantName: onboarding.application.applicantName,
          email: onboarding.application.email,
          job: onboarding.application.job,
          stage: onboarding.application.stage,
        },
      }),
    });
  } catch (error: unknown) {
    console.error("Error fetching onboarding:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat onboarding" },
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
    const existing = await prisma.jobOnboarding.findUnique({
      where: { id },
      include: { application: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Onboarding tidak ditemukan" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateOnboardingSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Data tidak valid";
      return NextResponse.json(
        { success: false, message: msg, errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data: {
      status?: string;
      employeeId?: string | null;
      onboardingDate?: Date | null;
      completedAt?: Date | null;
    } = {};

    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.employeeId !== undefined) {
      if (parsed.data.employeeId === null || parsed.data.employeeId === "") {
        data.employeeId = null;
      } else {
        const emp = await prisma.employee.findUnique({
          where: { id: parsed.data.employeeId },
        });
        if (!emp) {
          return NextResponse.json(
            { success: false, message: "Employee tidak ditemukan" },
            { status: 400 },
          );
        }
        data.employeeId = parsed.data.employeeId;
      }
    }
    if (parsed.data.onboardingDate !== undefined) {
      data.onboardingDate =
        parsed.data.onboardingDate == null || parsed.data.onboardingDate === ""
          ? null
          : new Date(`${parsed.data.onboardingDate}T00:00:00.000Z`);
    }
    if (parsed.data.completedAt !== undefined) {
      data.completedAt =
        parsed.data.completedAt == null || parsed.data.completedAt === ""
          ? null
          : new Date(`${parsed.data.completedAt}T00:00:00.000Z`);
    }

    const onboarding = await prisma.jobOnboarding.update({
      where: { id },
      data,
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
      message: "Onboarding berhasil diperbarui",
      data: onboardingToResponse({
        ...onboarding,
        application: {
          id: onboarding.application.id,
          applicantName: onboarding.application.applicantName,
          email: onboarding.application.email,
          job: onboarding.application.job,
          stage: onboarding.application.stage,
        },
      }),
    });
  } catch (error: unknown) {
    console.error("Error updating onboarding:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui onboarding" },
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

    await prisma.jobOnboarding.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding berhasil dihapus",
    });
  } catch (error: unknown) {
    console.error("Error deleting onboarding:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus onboarding" },
      { status: 500 },
    );
  }
}
