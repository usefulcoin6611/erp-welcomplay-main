import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const SETTING_KEY = "system_cookie_settings";

type CookieSettings = {
  cookie_enable: boolean;
  cookie_logging: boolean;
  strictly_necessary_title: string;
  strictly_necessary_description: string;
  contact_us_url: string;
  contact_us_description: string;
  cookie_title: string;
  cookie_description: string;
};

function getDefaultSettings(): CookieSettings {
  return {
    cookie_enable: false,
    cookie_logging: false,
    strictly_necessary_title: "Strictly necessary cookies",
    strictly_necessary_description:
      "These cookies are essential for the proper functioning of my website.",
    contact_us_url: "",
    contact_us_description:
      "For any queries in relation to our policy on cookies and your choices, please contact us.",
    cookie_title: "We use cookies!",
    cookie_description:
      "Hi, this website uses essential cookies to ensure its proper operation and tracking cookies to understand how you interact with it.",
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

    let parsed: CookieSettings | null = null;
    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading cookie settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load cookie settings",
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

    const body = (await request.json()) as Partial<CookieSettings>;
    const current = getDefaultSettings();

    const existing = await prisma.setting.findUnique({
      where: { key_userId: { key: SETTING_KEY, userId: targetUserId } },
    });

    let existingParsed = {} as CookieSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: CookieSettings = {
      ...current,
      ...existingParsed,
      ...body,
    };

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
    console.error("Error saving cookie settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save cookie settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
