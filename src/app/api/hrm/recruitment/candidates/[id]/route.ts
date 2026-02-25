import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

function toDateOnlyString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function applicationToCandidate(app: {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  appliedDate: Date;
  rating: number;
  resume: string | null;
  skill: string | null;
  job: { title: string };
  stage: { name: string };
}) {
  const skills = app.skill ? app.skill.split(",").map((s) => s.trim()).filter(Boolean) : [];
  return {
    id: app.id,
    name: app.applicantName,
    email: app.email,
    phone: app.phone,
    position: app.job.title,
    skills,
    experience: "",
    status: app.stage.name,
    rating: app.rating,
    appliedAt: toDateOnlyString(app.appliedDate),
    resume: app.resume ?? undefined,
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

    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: { select: { title: true } },
        stage: { select: { name: true } },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Kandidat tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: applicationToCandidate(application),
    });
  } catch (error: unknown) {
    console.error("Error fetching recruitment candidate:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat kandidat" },
      { status: 500 },
    );
  }
}
