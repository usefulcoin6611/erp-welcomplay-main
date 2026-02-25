import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateApplicationSchema = z.object({
  stageId: z.string().trim().min(1).optional(),
  applicantName: z.string().trim().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().min(1).optional(),
  appliedDate: z.string().trim().min(1).optional(),
  rating: z.coerce.number().int().min(0).max(5).optional(),
  resume: z.string().trim().optional().nullable(),
  coverLetter: z.string().trim().optional().nullable(),
  isArchive: z.boolean().optional(),
  dob: z.string().trim().optional().nullable(),
  gender: z.string().trim().optional().nullable(),
  country: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  profile: z.string().trim().optional().nullable(),
  skill: z.string().trim().optional().nullable(),
  customQuestion: z.record(z.string()).optional().nullable(),
});

const addNoteSchema = z.object({
  note: z.string().trim().min(1, "Catatan wajib diisi"),
  noteCreatedName: z.string().trim().min(1, "Nama pembuat catatan wajib diisi"),
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
        { success: false, message: "Lamaran tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: applicationToResponse(application) });
  } catch (error: unknown) {
    console.error("Error fetching recruitment application:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat lamaran" },
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
    const existing = await prisma.jobApplication.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Lamaran tidak ditemukan" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateApplicationSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Data tidak valid";
      return NextResponse.json(
        { success: false, message: msg, errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data: Record<string, unknown> = {};

    if (parsed.data.stageId !== undefined) {
      const stage = await prisma.jobStage.findUnique({ where: { id: parsed.data.stageId } });
      if (!stage) {
        return NextResponse.json(
          { success: false, message: "Job stage tidak ditemukan" },
          { status: 400 },
        );
      }
      data.stageId = parsed.data.stageId;
    }
    if (parsed.data.applicantName !== undefined) data.applicantName = parsed.data.applicantName;
    if (parsed.data.email !== undefined) data.email = parsed.data.email;
    if (parsed.data.phone !== undefined) data.phone = parsed.data.phone;
    if (parsed.data.rating !== undefined) data.rating = parsed.data.rating;
    if (parsed.data.resume !== undefined) data.resume = parsed.data.resume;
    if (parsed.data.coverLetter !== undefined) data.coverLetter = parsed.data.coverLetter;
    if (parsed.data.isArchive !== undefined) data.isArchive = parsed.data.isArchive;
    if (parsed.data.dob !== undefined) data.dob = parsed.data.dob;
    if (parsed.data.gender !== undefined) data.gender = parsed.data.gender;
    if (parsed.data.country !== undefined) data.country = parsed.data.country;
    if (parsed.data.state !== undefined) data.state = parsed.data.state;
    if (parsed.data.city !== undefined) data.city = parsed.data.city;
    if (parsed.data.profile !== undefined) data.profile = parsed.data.profile;
    if (parsed.data.skill !== undefined) data.skill = parsed.data.skill;
    if (parsed.data.customQuestion !== undefined) data.customQuestion = parsed.data.customQuestion;

    if (parsed.data.appliedDate !== undefined) {
      const d = new Date(`${parsed.data.appliedDate}T00:00:00.000Z`);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json(
          { success: false, message: "Format tanggal tidak valid" },
          { status: 400 },
        );
      }
      data.appliedDate = d;
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data,
      include: {
        job: { select: { title: true } },
        stage: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Lamaran berhasil diperbarui",
      data: applicationToResponse(application),
    });
  } catch (error: unknown) {
    console.error("Error updating recruitment application:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui lamaran" },
      { status: 500 },
    );
  }
}

export async function PATCH(
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
    const application = await prisma.jobApplication.findUnique({ where: { id } });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Lamaran tidak ditemukan" },
        { status: 404 },
      );
    }

    const body = await request.json();

    if (body.stageId !== undefined) {
      const stage = await prisma.jobStage.findUnique({ where: { id: String(body.stageId) } });
      if (!stage) {
        return NextResponse.json(
          { success: false, message: "Job stage tidak ditemukan" },
          { status: 400 },
        );
      }
      await prisma.jobApplication.update({
        where: { id },
        data: { stageId: String(body.stageId) },
      });
      const updated = await prisma.jobApplication.findUnique({
        where: { id },
        include: { job: { select: { title: true } }, stage: { select: { name: true } } },
      });
      return NextResponse.json({
        success: true,
        message: "Stage berhasil diubah",
        data: updated ? applicationToResponse(updated) : null,
      });
    }

    if (body.isArchive !== undefined) {
      await prisma.jobApplication.update({
        where: { id },
        data: { isArchive: Boolean(body.isArchive) },
      });
      const updated = await prisma.jobApplication.findUnique({
        where: { id },
        include: { job: { select: { title: true } }, stage: { select: { name: true } } },
      });
      return NextResponse.json({
        success: true,
        message: body.isArchive ? "Lamaran diarsipkan" : "Lamaran dibatalkan arsip",
        data: updated ? applicationToResponse(updated) : null,
      });
    }

    if (body.note !== undefined || body.noteCreatedName !== undefined) {
      const parsed = addNoteSchema.safeParse({
        note: body.note ?? "",
        noteCreatedName: body.noteCreatedName ?? (session.user as { name?: string })?.name ?? "User",
      });
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, message: parsed.error.errors[0]?.message ?? "Data tidak valid" },
          { status: 400 },
        );
      }
      const notes = (Array.isArray(application.notes) ? application.notes : []) as { id: string; note: string; createdAt: string; noteCreatedName: string }[];
      const newNote = {
        id: `n-${Date.now()}`,
        note: parsed.data.note,
        createdAt: new Date().toISOString().split("T")[0],
        noteCreatedName: parsed.data.noteCreatedName,
      };
      const updated = await prisma.jobApplication.update({
        where: { id },
        data: { notes: [...notes, newNote] },
        include: { job: { select: { title: true } }, stage: { select: { name: true } } },
      });
      return NextResponse.json({
        success: true,
        message: "Catatan berhasil ditambahkan",
        data: applicationToResponse(updated),
      });
    }

    return NextResponse.json(
      { success: false, message: "Tidak ada field yang diubah (stageId, isArchive, atau note)" },
      { status: 400 },
    );
  } catch (error: unknown) {
    console.error("Error patching recruitment application:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui lamaran" },
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

    await prisma.jobApplication.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Lamaran berhasil dihapus",
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Lamaran tidak ditemukan" },
        { status: 404 },
      );
    }
    console.error("Error deleting recruitment application:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus lamaran" },
      { status: 500 },
    );
  }
}
