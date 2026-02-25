import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateInterviewSchema = z.object({
  interviewDate: z.string().trim().min(1).optional(),
  interviewTime: z.string().trim().min(1).optional(),
  interviewer: z.string().trim().min(1).optional(),
  location: z.string().trim().min(1).optional(),
  status: z.string().trim().optional(),
});

function toDateOnlyString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

    const interview = await prisma.recruitmentInterview.findUnique({
      where: { id },
      include: {
        application: {
          select: { id: true, applicantName: true, job: { select: { title: true } } },
        },
      },
    });

    if (!interview) {
      return NextResponse.json(
        { success: false, message: "Jadwal interview tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: interview.id,
        candidateName: interview.application.applicantName,
        position: interview.application.job.title,
        applicationId: interview.application.id,
        interviewDate: toDateOnlyString(interview.interviewDate),
        interviewTime: interview.interviewTime,
        interviewer: interview.interviewer,
        location: interview.location,
        status: interview.status,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching recruitment interview:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat jadwal interview" },
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
    const existing = await prisma.recruitmentInterview.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Jadwal interview tidak ditemukan" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateInterviewSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Data tidak valid";
      return NextResponse.json(
        { success: false, message: msg, errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.interviewTime !== undefined) data.interviewTime = parsed.data.interviewTime;
    if (parsed.data.interviewer !== undefined) data.interviewer = parsed.data.interviewer;
    if (parsed.data.location !== undefined) data.location = parsed.data.location;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;

    if (parsed.data.interviewDate !== undefined) {
      const d = new Date(`${parsed.data.interviewDate}T00:00:00.000Z`);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { success: false, message: "Format tanggal tidak valid" },
          { status: 400 },
        );
      }
      data.interviewDate = d;
    }

    const interview = await prisma.recruitmentInterview.update({
      where: { id },
      data,
      include: {
        application: {
          select: { id: true, applicantName: true, job: { select: { title: true } } },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Jadwal interview berhasil diperbarui",
      data: {
        id: interview.id,
        candidateName: interview.application.applicantName,
        position: interview.application.job.title,
        applicationId: interview.application.id,
        interviewDate: toDateOnlyString(interview.interviewDate),
        interviewTime: interview.interviewTime,
        interviewer: interview.interviewer,
        location: interview.location,
        status: interview.status,
      },
    });
  } catch (error: unknown) {
    console.error("Error updating recruitment interview:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui jadwal interview" },
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

    await prisma.recruitmentInterview.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Jadwal interview berhasil dihapus",
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Jadwal interview tidak ditemukan" },
        { status: 404 },
      );
    }
    console.error("Error deleting recruitment interview:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus jadwal interview" },
      { status: 500 },
    );
  }
}
