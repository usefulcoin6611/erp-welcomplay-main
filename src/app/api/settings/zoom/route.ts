import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTING_KEY = "system_zoom_settings";

type ZoomSettings = {
  zoom_api_key: string;
  zoom_api_secret: string;
};

function getDefaultSettings(): ZoomSettings {
  return {
    zoom_api_key: "",
    zoom_api_secret: "",
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

    let parsed: ZoomSettings | null = null;

    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading zoom settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load zoom settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ZoomSettings>;
    const current = getDefaultSettings();

    // Fetch existing settings to preserve password if not updated
    const existing = await prisma.setting.findUnique({
      where: { key: SETTING_KEY },
    });

    let existingParsed = {} as ZoomSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: ZoomSettings = {
      ...current,
      ...existingParsed,
      ...body,
    };

    // if the password is empty string from frontend, keep existing
    if (!body.zoom_api_secret && existingParsed.zoom_api_secret) {
      merged.zoom_api_secret = existingParsed.zoom_api_secret;
    }

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
    console.error("Error saving zoom settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save zoom settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
