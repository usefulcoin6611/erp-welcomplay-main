import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const SETTING_KEY = "system_cache_settings";

type CacheSettings = {
  cache_enabled: boolean;
  cache_size: string;
};

function getDefaultSettings(): CacheSettings {
  return {
    cache_enabled: false,
    cache_size: "1024",
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    let existing = null;
    if (userId) {
      existing = await prisma.setting.findFirst({
        where: { key: SETTING_KEY, userId },
      });
    }

    if (!existing) {
      existing = await prisma.setting.findFirst({
        where: { key: SETTING_KEY, userId: null },
      });
    }

    if (!existing) {
      return NextResponse.json({
        success: true,
        data: getDefaultSettings(),
      });
    }

    let parsed: CacheSettings | null = null;
    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading cache settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load cache settings",
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

    const body = (await request.json()) as Partial<CacheSettings>;
    const current = getDefaultSettings();

    const existing = await prisma.setting.findFirst({
      where: { key: SETTING_KEY, userId: targetUserId as any },
    });

    let existingParsed = {} as CacheSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: CacheSettings = {
      ...current,
      ...existingParsed,
      ...body,
    };

    await prisma.setting.upsert({
      where: { key_userId: { key: SETTING_KEY, userId: targetUserId as any } },
      update: { value: JSON.stringify(merged) },
      create: {
        key: SETTING_KEY,
        userId: targetUserId,
        value: JSON.stringify(merged),
      },
    });
    return NextResponse.json({ success: true, data: merged });
  } catch (error) {
    console.error("Error saving cache settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load cache settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
