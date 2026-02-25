import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createQuestionSchema = z.object({
  question: z.string().trim().min(1, "Pertanyaan wajib diisi"),
  isRequired: z.union([z.boolean(), z.enum(["yes", "no"])]).optional(),
});

function questionToResponse(q: { id: string; question: string; isRequired: boolean }) {
  return {
    id: q.id,
    question: q.question,
    isRequired: q.isRequired ? "yes" : "no",
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

    const questions = await prisma.recruitmentQuestion.findMany({
      orderBy: { createdAt: "desc" },
    });

    const data = questions.map(questionToResponse);
    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Error fetching recruitment questions:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat custom question" },
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
    const parsed = createQuestionSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Data tidak valid";
      return NextResponse.json(
        { success: false, message: msg, errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    let isRequired = false;
    if (parsed.data.isRequired === true || parsed.data.isRequired === "yes") {
      isRequired = true;
    } else if (parsed.data.isRequired === false || parsed.data.isRequired === "no") {
      isRequired = false;
    }

    const question = await prisma.recruitmentQuestion.create({
      data: {
        question: parsed.data.question,
        isRequired,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Custom question berhasil dibuat",
      data: questionToResponse(question),
    });
  } catch (error: unknown) {
    console.error("Error creating recruitment question:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat custom question" },
      { status: 500 },
    );
  }
}
