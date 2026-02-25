import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateQuestionSchema = z.object({
  question: z.string().trim().min(1).optional(),
  isRequired: z.union([z.boolean(), z.enum(["yes", "no"])]).optional(),
});

function questionToResponse(q: { id: string; question: string; isRequired: boolean }) {
  return {
    id: q.id,
    question: q.question,
    isRequired: q.isRequired ? "yes" : "no",
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

    const question = await prisma.recruitmentQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, message: "Custom question tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: questionToResponse(question) });
  } catch (error: unknown) {
    console.error("Error fetching recruitment question:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat custom question" },
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
    const body = await request.json();
    const parsed = updateQuestionSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Data tidak valid";
      return NextResponse.json(
        { success: false, message: msg, errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data: { question?: string; isRequired?: boolean } = {};
    if (parsed.data.question !== undefined) data.question = parsed.data.question;
    if (parsed.data.isRequired !== undefined) {
      data.isRequired =
        parsed.data.isRequired === true || parsed.data.isRequired === "yes";
    }

    const question = await prisma.recruitmentQuestion.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Custom question berhasil diperbarui",
      data: questionToResponse(question),
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Custom question tidak ditemukan" },
        { status: 404 },
      );
    }
    console.error("Error updating recruitment question:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui custom question" },
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

    await prisma.recruitmentQuestion.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Custom question berhasil dihapus",
    });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Custom question tidak ditemukan" },
        { status: 404 },
      );
    }
    console.error("Error deleting recruitment question:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus custom question" },
      { status: 500 },
    );
  }
}
