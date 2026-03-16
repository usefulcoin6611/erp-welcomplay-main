import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const SETTING_KEY = "system_letter_templates";

type LetterTemplates = {
  offer_letter: string;
  joining_letter: string;
  experience_certificate: string;
  noc: string;
};

function getDefaultSettings(): LetterTemplates {
  return {
    offer_letter: "",
    joining_letter: "",
    experience_certificate: "",
    noc: "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    let existing = null;
    if (userId) {
      existing = await prisma.setting.findFirst({
        where: { key: SETTING_KEY, userId },
      });
    }

    if (!existing) {
      existing = await prisma.setting.findFirst({
        where: { key: SETTING_KEY, userId: null },
      });
    }

    if (!existing) {
      return NextResponse.json({
        success: true,
        data: getDefaultSettings(),
      });
    }

    let parsed: LetterTemplates | null = null;
    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading letter templates:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load letter templates",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { role, id: userId } = session.user as any;
    const targetUserId = role === "super admin" ? null : userId;

    const body = (await request.json()) as Partial<LetterTemplates>;
    const currentDefaults = getDefaultSettings();

    const existing = await prisma.setting.findUnique({
      where: { key_userId: { key: SETTING_KEY, userId: targetUserId } },
    });

    let existingParsed = {};
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: LetterTemplates = {
      ...currentDefaults,
      ...existingParsed,
      ...body,
    };

    await prisma.setting.upsert({
      where: { key_userId: { key: SETTING_KEY, userId: targetUserId as any } },
      update: { value: JSON.stringify(merged) },
      create: {
        key: SETTING_KEY,
        userId: targetUserId,
        value: JSON.stringify(merged),
      },
    });

    return NextResponse.json({ success: true, data: merged });
  } catch (error) {
    console.error("Error saving letter templates:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save letter templates",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
