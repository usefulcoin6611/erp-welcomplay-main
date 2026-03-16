import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const SETTING_KEY = "system_email_settings";

type EmailSettings = {
  mail_driver: string;
  mail_host: string;
  mail_port: string;
  mail_username: string;
  mail_password?: string;
  mail_encryption: string;
  mail_from_address: string;
  mail_from_name: string;
};

function getDefaultSettings(): EmailSettings {
  return {
    mail_driver: "smtp",
    mail_host: "smtp.gmail.com",
    mail_port: "587",
    mail_username: "",
    mail_password: "",
    mail_encryption: "tls",
    mail_from_address: "noreply@example.com",
    mail_from_name: "ERP System",
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    // First try to find user-specific settings if userId exists
    let existing = null;
    if (userId) {
      existing = await prisma.setting.findUnique({
        where: {
          key_userId: {
            key: SETTING_KEY,
            userId: userId,
          },
        },
      });
    }

    // If no user-specific settings, fallback to global settings
    if (!existing) {
      existing = await prisma.setting.findUnique({
        where: {
          key_userId: {
            key: SETTING_KEY,
            userId: null,
          },
        },
      });
    }

    if (!existing) {
      return NextResponse.json({
        success: true,
        data: getDefaultSettings(),
      });
    }

    let parsed: EmailSettings | null = null;
    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading email settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load email settings",
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
    const targetUserId = role === "super admin" ? null : userId;

    const body = (await request.json()) as Partial<EmailSettings>;
    const currentDefaults = getDefaultSettings();

    // Fetch existing settings for this target to preserve password if not updated
    const existing = await prisma.setting.findUnique({
      where: {
        key_userId: {
          key: SETTING_KEY,
          userId: targetUserId,
        },
      },
    });

    let existingParsed = {} as EmailSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: EmailSettings = {
      ...currentDefaults,
      ...existingParsed,
      ...body,
    };

    // if the password is empty string from frontend, keep existing
    if (!body.mail_password && existingParsed.mail_password) {
      merged.mail_password = existingParsed.mail_password;
    }

    await prisma.setting.upsert({
      where: {
        key_userId: {
          key: SETTING_KEY,
          userId: targetUserId,
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
    console.error("Error saving email settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save email settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
