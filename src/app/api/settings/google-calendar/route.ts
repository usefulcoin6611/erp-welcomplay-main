import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const SETTING_KEY = "system_google_calendar_settings";

type GoogleCalendarSettings = {
  google_calendar_enable: boolean;
  google_calendar_client_id: string;
  google_calendar_client_secret: string;
  google_calendar_redirect_url: string;
};

function getDefaultSettings(): GoogleCalendarSettings {
  return {
    google_calendar_enable: false,
    google_calendar_client_id: "",
    google_calendar_client_secret: "",
    google_calendar_redirect_url: "",
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

    let parsed: GoogleCalendarSettings | null = null;
    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading google calendar settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load google calendar settings",
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

    const body = (await request.json()) as Partial<GoogleCalendarSettings>;
    const currentDefaults = getDefaultSettings();

    const existing = await prisma.setting.findUnique({
      where: { key_userId: { key: SETTING_KEY, userId: targetUserId } },
    });

    let existingParsed = {} as GoogleCalendarSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: GoogleCalendarSettings = {
      ...currentDefaults,
      ...existingParsed,
      ...body,
    };

    // if the secret is empty string from frontend, keep existing
    if (!body.google_calendar_client_secret && existingParsed.google_calendar_client_secret) {
      merged.google_calendar_client_secret = existingParsed.google_calendar_client_secret;
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
    console.error("Error saving google calendar settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save google calendar settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
