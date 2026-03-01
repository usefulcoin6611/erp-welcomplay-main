import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

export async function GET() {
  try {
    const existing = await prisma.setting.findUnique({
      where: { key: SETTING_KEY },
    });

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
    const body = (await request.json()) as Partial<CookieSettings>;
    const current = getDefaultSettings();

    // Fetch existing settings to preserve missing values & passwords
    const existing = await prisma.setting.findUnique({
      where: { key: SETTING_KEY },
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
      where: { key: SETTING_KEY },
      update: { value: JSON.stringify(merged) },
      create: {
        key: SETTING_KEY,
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
