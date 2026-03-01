import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTING_KEY = "system_brand_settings";

type BrandSettings = {
  logo_dark: string | null;
  logo_light: string | null;
  favicon: string | null;
  title_text: string;
  footer_text: string;
  default_language: string;
  landing_page: boolean;
  enable_signup: boolean;
  email_verification: boolean;
  primary_color: string;
  transparent_layout: boolean;
  dark_layout: boolean;
  rtl_layout: boolean;
};

function getDefaultSettings(): BrandSettings {
  return {
    logo_dark: null,
    logo_light: null,
    favicon: null,
    title_text: "ERPGo SaaS",
    footer_text: "ERPGo SaaS",
    default_language: "en",
    landing_page: true,
    enable_signup: true,
    email_verification: false,
    primary_color: "#000000",
    transparent_layout: true,
    dark_layout: false,
    rtl_layout: false,
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
    const body = (await request.json()) as Partial<BrandSettings>;
    const current = getDefaultSettings();

    // Fetch existing settings to preserve values that aren't provided in the update
    const existing = await prisma.setting.findUnique({
      where: { key: SETTING_KEY },
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
