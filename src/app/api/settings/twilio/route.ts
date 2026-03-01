import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTING_KEY = "system_twilio_settings";

type TwilioSettings = {
  twilio_sid: string;
  twilio_token: string;
  twilio_from: string;
};

function getDefaultSettings(): TwilioSettings {
  return {
    twilio_sid: "",
    twilio_token: "",
    twilio_from: "",
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

    let parsed: TwilioSettings | null = null;

    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading twilio settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load twilio settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<TwilioSettings>;
    const current = getDefaultSettings();

    // Fetch existing settings to preserve password if not updated
    const existing = await prisma.setting.findUnique({
      where: { key: SETTING_KEY },
    });

    let existingParsed = {} as TwilioSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: TwilioSettings = {
      ...current,
      ...existingParsed,
      ...body,
    };

    // if the password is empty string from frontend, keep existing
    if (!body.twilio_token && existingParsed.twilio_token) {
      merged.twilio_token = existingParsed.twilio_token;
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
    console.error("Error saving twilio settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save twilio settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
