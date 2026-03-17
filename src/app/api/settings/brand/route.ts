import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const SETTING_KEY = "system_brand_settings";

type BrandSettings = {
  logo_dark: string | null;
  logo_light: string | null;
  favicon: string | null;
  title_text: string | null;
  footer_text: string | null;
  default_language: string;
  landing_page: boolean;
  enable_signup: boolean;
  email_verification: boolean;
  primary_color: string;
  transparent_layout: boolean;
  dark_layout: boolean;
  rtl_layout: boolean;
  enable_coupon: boolean;
};

function getDefaultSettings(): BrandSettings {
  return {
    logo_dark: null,
    logo_light: null,
    favicon: null,
    title_text: null,
    footer_text: null,
    default_language: "en",
    landing_page: true,
    enable_signup: true,
    email_verification: false,
    primary_color: "#000000",
    transparent_layout: true,
    dark_layout: false,
    rtl_layout: false,
    enable_coupon: false,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    // First try to find user-specific settings if userId exists
    let existing = null;
    if (userId) {
      existing = await prisma.setting.findFirst({
        where: {
          key: SETTING_KEY,
          userId: userId,
        },
      });
    }

    // If no user-specific settings, fallback to global settings
    if (!existing) {
      existing = await prisma.setting.findFirst({
        where: {
          key: SETTING_KEY,
          userId: null,
        },
      });
    }

    if (!existing) {
      return NextResponse.json({
        success: true,
        data: getDefaultSettings(),
      });
    }

    let parsed: BrandSettings | null = null;
    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading brand settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load brand settings",
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
    // Super admin edits global settings (userId: null)
    // Company owners edit their own settings
    const targetUserId = role === "super admin" ? null : userId;

    const body = (await request.json()) as Partial<BrandSettings>;
    const currentDefaults = getDefaultSettings();

    // Fetch existing settings for this target to preserve values
    const existing = await prisma.setting.findUnique({
      where: {
        key_userId: {
          key: SETTING_KEY,
          userId: targetUserId,
        },
      },
    });

    let existingParsed = {};
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: BrandSettings = {
      ...currentDefaults,
      ...existingParsed,
      ...body,
    };

    await prisma.setting.upsert({
      where: {
        key_userId: {
          key: SETTING_KEY,
          userId: targetUserId as any,
        },
      },
      update: { value: JSON.stringify(merged) },
      create: {
        key: SETTING_KEY,
        userId: targetUserId,
        value: JSON.stringify(merged),
      },
    });

    return NextResponse.json({ success: true, data: merged });
  } catch (error) {
    console.error("Error saving brand settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save brand settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
