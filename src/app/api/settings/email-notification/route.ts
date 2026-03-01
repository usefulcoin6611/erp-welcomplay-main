import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTING_KEY = "system_email_notification_settings";

type EmailNotificationSettings = {
  notify_new_user: boolean;
  notify_new_order: boolean;
  notify_plan_expired: boolean;
  notify_payment: boolean;
};

function getDefaultSettings(): EmailNotificationSettings {
  return {
    notify_new_user: true,
    notify_new_order: true,
    notify_plan_expired: true,
    notify_payment: true,
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

    let parsed: EmailNotificationSettings | null = null;

    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading email notification settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load email notification settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<EmailNotificationSettings>;
    const current = getDefaultSettings();

    // Fetch existing settings to preserve missing values
    const existing = await prisma.setting.findUnique({
      where: { key: SETTING_KEY },
    });

    let existingParsed = {} as EmailNotificationSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: EmailNotificationSettings = {
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
    console.error("Error saving email notification settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save email notification settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
