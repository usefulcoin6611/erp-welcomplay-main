import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const SETTING_KEY = "system_recaptcha_settings";

type ReCaptchaSettings = {
  recaptcha_module: string;
  google_recaptcha_key: string;
  google_recaptcha_secret: string;
};

function getDefaultSettings(): ReCaptchaSettings {
  return {
    recaptcha_module: "no",
    google_recaptcha_key: "",
    google_recaptcha_secret: "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    let existing = null;
    if (userId) {
      existing = await prisma.setting.findUnique({
        where: { key_userId: { key: SETTING_KEY, userId } },
      });
    }

    if (!existing) {
      existing = await prisma.setting.findUnique({
        where: { key_userId: { key: SETTING_KEY, userId: null } },
      });
    }

    if (!existing) {
      return NextResponse.json({
        success: true,
        data: getDefaultSettings(),
      });
    }

    let parsed: ReCaptchaSettings | null = null;
    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading recaptcha settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load recaptcha settings",
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

    const body = (await request.json()) as Partial<ReCaptchaSettings>;
    const current = getDefaultSettings();

    const existing = await prisma.setting.findUnique({
      where: { key_userId: { key: SETTING_KEY, userId: targetUserId } },
    });

    let existingParsed = {} as ReCaptchaSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: ReCaptchaSettings = {
      ...current,
      ...existingParsed,
      ...body,
    };

    if (!body.google_recaptcha_secret && existingParsed.google_recaptcha_secret) {
      merged.google_recaptcha_secret = existingParsed.google_recaptcha_secret;
    }

    await prisma.setting.upsert({
      where: { key_userId: { key: SETTING_KEY, userId: targetUserId } },
      update: { value: JSON.stringify(merged) },
      create: {
        key: SETTING_KEY,
        userId: targetUserId,
        value: JSON.stringify(merged),
      },
    });
    return NextResponse.json({ success: true, data: merged });
  } catch (error) {
    console.error("Error saving recaptcha settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save recaptcha settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
