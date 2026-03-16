import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const SETTING_KEY = "system_storage_settings";

type StorageSettings = {
  storage_type: string;
  local_storage_url?: string;
  s3_key?: string;
  s3_secret?: string;
  s3_region?: string;
  s3_bucket?: string;
  s3_url?: string;
  s3_endpoint?: string;
  wasabi_key?: string;
  wasabi_secret?: string;
  wasabi_region?: string;
  wasabi_bucket?: string;
  wasabi_url?: string;
  wasabi_root?: string;
  max_upload_size: string;
};

function getDefaultSettings(): StorageSettings {
  return {
    storage_type: "local",
    local_storage_url: "localhost:3000",
    s3_key: "",
    s3_secret: "",
    s3_region: "",
    s3_bucket: "",
    s3_url: "",
    s3_endpoint: "",
    wasabi_key: "",
    wasabi_secret: "",
    wasabi_region: "",
    wasabi_bucket: "",
    wasabi_url: "",
    wasabi_root: "",
    max_upload_size: "2048",
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

    let parsed: StorageSettings | null = null;
    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading storage settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load storage settings",
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

    const body = (await request.json()) as Partial<StorageSettings>;
    const current = getDefaultSettings();

    const existing = await prisma.setting.findUnique({
      where: { key_userId: { key: SETTING_KEY, userId: targetUserId } },
    });

    let existingParsed = {} as StorageSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: StorageSettings = {
      ...current,
      ...existingParsed,
      ...body,
    };

    if (!body.s3_secret && existingParsed.s3_secret) {
      merged.s3_secret = existingParsed.s3_secret;
    }
    if (!body.wasabi_secret && existingParsed.wasabi_secret) {
      merged.wasabi_secret = existingParsed.wasabi_secret;
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
    console.error("Error saving storage settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save storage settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
