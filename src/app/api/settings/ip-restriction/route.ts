import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { getSetting, saveSetting } from "@/lib/settings";

const SETTING_KEY = "system_ip_restriction_settings";

type IpRestrictionSettings = {
  ip_restriction_enable: boolean;
  allowed_ips: string;
  blocked_ips: string;
};

function getDefaultSettings(): IpRestrictionSettings {
  return {
    ip_restriction_enable: false,
    allowed_ips: "",
    blocked_ips: "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    const existing = await getSetting(SETTING_KEY, userId);

    if (!existing) {
      return NextResponse.json({
        success: true,
        data: getDefaultSettings(),
      });
    }

    let parsed: IpRestrictionSettings | null = null;
    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading IP restriction settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load IP restriction settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/settings/ip-restriction
 * Simpan pengaturan IP restriction
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { role, id: userId } = session.user as any;
    const targetUserId = role === "super admin" ? null : userId;

    const body = (await request.json()) as Partial<IpRestrictionSettings>;
    const current = getDefaultSettings();

    const existing = await getSetting(SETTING_KEY, targetUserId);

    let existingParsed = {} as IpRestrictionSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: IpRestrictionSettings = {
      ...current,
      ...existingParsed,
      ...body,
    };

    await saveSetting(SETTING_KEY, JSON.stringify(merged), targetUserId);
    return NextResponse.json({ success: true, data: merged });
  } catch (error) {
    console.error("Error saving IP restriction settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save IP restriction settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
