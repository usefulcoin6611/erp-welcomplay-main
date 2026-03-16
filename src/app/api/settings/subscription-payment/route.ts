import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const SETTING_KEY = "subscription_payment_settings";

type SubscriptionPaymentSettings = {
  currency: string;
  currency_symbol: string;
  manually_enabled: boolean;
  bank_transfer_enabled: boolean;
  bank_details: string;
  stripe_enabled: boolean;
  stripe_key: string;
  stripe_secret: string;
  paypal_enabled: boolean;
  paypal_mode: string;
  paypal_client_id: string;
  paypal_secret: string;
};

function getDefaultSettings(): SubscriptionPaymentSettings {
  return {
    currency: "IDR",
    currency_symbol: "Rp",
    manually_enabled: false,
    bank_transfer_enabled: true,
    bank_details: "",
    stripe_enabled: false,
    stripe_key: "",
    stripe_secret: "",
    paypal_enabled: false,
    paypal_mode: "sandbox",
    paypal_client_id: "",
    paypal_secret: "",
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

    let parsed: SubscriptionPaymentSettings | null = null;
    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading subscription payment settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load subscription payment settings",
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

    const body = (await request.json()) as Partial<SubscriptionPaymentSettings>;
    const current = getDefaultSettings();

    const existing = await prisma.setting.findUnique({
      where: { key_userId: { key: SETTING_KEY, userId: targetUserId } },
    });

    let existingParsed = {} as SubscriptionPaymentSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: SubscriptionPaymentSettings = {
      ...current,
      ...existingParsed,
      ...body,
    };

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
    console.error("Error saving subscription payment settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save subscription payment settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
