import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTING_KEY = "system_webhook_settings";

type WebhookSettings = {
  webhook_url: string;
  webhook_method: string;
  webhook_secret: string;
};

function getDefaultSettings(): WebhookSettings {
  return {
    webhook_url: "",
    webhook_method: "post",
    webhook_secret: "",
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

    let parsed: WebhookSettings | null = null;

    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading webhook settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load webhook settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<WebhookSettings>;
    const current = getDefaultSettings();

    // Fetch existing settings to preserve password if not updated
    const existing = await prisma.setting.findUnique({
      where: { key: SETTING_KEY },
    });

    let existingParsed = {} as WebhookSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: WebhookSettings = {
      ...current,
      ...existingParsed,
      ...body,
    };

    // if the password is empty string from frontend, keep existing
    if (!body.webhook_secret && existingParsed.webhook_secret) {
      merged.webhook_secret = existingParsed.webhook_secret;
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
    console.error("Error saving webhook settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save webhook settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
