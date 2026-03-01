import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTING_KEY = "system_pusher_settings";

type PusherSettings = {
  pusher_app_id: string;
  pusher_app_key: string;
  pusher_app_secret: string;
  pusher_app_cluster: string;
};

function getDefaultSettings(): PusherSettings {
  return {
    pusher_app_id: "",
    pusher_app_key: "",
    pusher_app_secret: "",
    pusher_app_cluster: "",
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

    let parsed: PusherSettings | null = null;

    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading pusher settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load pusher settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<PusherSettings>;
    const current = getDefaultSettings();

    // Fetch existing settings to preserve missing values & passwords
    const existing = await prisma.setting.findUnique({
      where: { key: SETTING_KEY },
    });

    let existingParsed = {} as PusherSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: PusherSettings = {
      ...current,
      ...existingParsed,
      ...body,
    };

    // if the password is empty string from frontend, keep existing
    if (!body.pusher_app_secret && existingParsed.pusher_app_secret) {
      merged.pusher_app_secret = existingParsed.pusher_app_secret;
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
    console.error("Error saving pusher settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save pusher settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
