import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const SETTING_KEY = "company_payment_gateways";

type CompanyGatewaySettings = {
  cash_enabled: boolean;
  bank_transfer_enabled: boolean;
  midtrans_enabled: boolean;
  xendit_enabled: boolean;
  paypal_enabled: boolean;
  custom?: { code: string; label: string }[];
};

function getDefaultSettings(): CompanyGatewaySettings {
  return {
    cash_enabled: true,
    bank_transfer_enabled: true,
    midtrans_enabled: true,
    xendit_enabled: true,
    paypal_enabled: false,
    custom: [],
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    // First try to find user-specific settings if userId exists
    let existing = null;
    if (userId) {
      existing = await prisma.setting.findFirst({
        where: {
          key: SETTING_KEY,
          userId: userId,
        },
      });
    }

    // If no user-specific settings, fallback to global settings
    if (!existing) {
      existing = await prisma.setting.findFirst({
        where: {
          key: SETTING_KEY,
          userId: null,
        },
      });
    }

    if (!existing) {
      return NextResponse.json({
        success: true,
        data: getDefaultSettings(),
      });
    }

    let parsed: CompanyGatewaySettings | null = null;
    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading company payment gateways:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load company payment gateways",
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

    const body = (await request.json()) as Partial<CompanyGatewaySettings>;
    const currentDefaults = getDefaultSettings();

    // Fetch existing settings for this target to preserve values
    const existing = await prisma.setting.findUnique({
      where: {
        key_userId: {
          key: SETTING_KEY,
          userId: targetUserId,
        },
      },
    });

    let existingParsed = {};
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: CompanyGatewaySettings = {
      ...currentDefaults,
      ...existingParsed,
      ...body,
      custom: body.custom ?? (existingParsed as any).custom ?? currentDefaults.custom,
    };

    await prisma.setting.upsert({
      where: {
        key_userId: {
          key: SETTING_KEY,
          userId: targetUserId as any,
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
    console.error("Error saving company payment gateways:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save company payment gateways",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
