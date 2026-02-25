import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createInterviewSchema = z.object({
  applicationId: z.string().trim().min(1, "Application wajib dipilih"),
  interviewDate: z.string().trim().min(1, "Tanggal wajib diisi"),
  interviewTime: z.string().trim().min(1, "Waktu wajib diisi"),
  interviewer: z.string().trim().min(1, "Interviewer wajib diisi"),
  location: z.string().trim().min(1, "Lokasi wajib diisi"),
  status: z.string().trim().default("Scheduled"),
});

function toDateOnlyString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const interviews = await prisma.recruitmentInterview.findMany({
      orderBy: [{ interviewDate: "desc" }, { interviewTime: "asc" }],
      include: {
        application: {
          select: {
            id: true,
            applicantName: true,
            job: { select: { title: true } },
          },
        },
      },
    });

    const data = interviews.map((int) => ({
      id: int.id,
      candidateName: int.application.applicantName,
      position: int.application.job.title,
      applicationId: int.application.id,
      interviewDate: toDateOnlyString(int.interviewDate),
      interviewTime: int.interviewTime,
      interviewer: int.interviewer,
      location: int.location,
      status: int.status,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error fetching recruitment interviews:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat jadwal interview" },
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
    const parsed = createInterviewSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Data tidak valid";
      return NextResponse.json(
        { success: false, message: msg, errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { applicationId, interviewDate, interviewTime, interviewer, location, status } = parsed.data;

    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: { select: { title: true } } },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Lamaran tidak ditemukan" },
        { status: 400 },
      );
    }

    const interviewDateObj = new Date(`${interviewDate}T00:00:00.000Z`);
    if (Number.isNaN(interviewDateObj.getTime())) {
      return NextResponse.json(
        { success: false, message: "Format tanggal tidak valid" },
        { status: 400 },
      );
    }

    const interview = await prisma.recruitmentInterview.create({
      data: {
        applicationId,
        interviewDate: interviewDateObj,
        interviewTime: interviewTime.trim(),
        interviewer: interviewer.trim(),
        location: location.trim(),
        status: (status || "Scheduled").trim(),
      },
      include: {
        application: {
          select: { id: true, applicantName: true, job: { select: { title: true } } },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Jadwal interview berhasil dibuat",
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
    console.error("Error creating recruitment interview:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat jadwal interview" },
      { status: 500 },
    );
  }
}
