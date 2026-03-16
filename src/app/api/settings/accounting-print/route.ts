import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

const SETTING_KEY = "accounting_print_settings";

type SingleDocPrintSetting = {
  template: string;
  qrDisplay: boolean;
  color: string;
  logoDataUrl?: string | null;
};

type AccountingPrintSettings = {
  proposal: SingleDocPrintSetting;
  invoice: SingleDocPrintSetting;
  bill: SingleDocPrintSetting;
};

function getDefaultDocSettings(): SingleDocPrintSetting {
  return {
    template: "new-york",
    qrDisplay: true,
    color: "#1e40af",
    logoDataUrl: null,
  };
}

function getDefaultSettings(): AccountingPrintSettings {
  return {
    proposal: getDefaultDocSettings(),
    invoice: getDefaultDocSettings(),
    bill: getDefaultDocSettings(),
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

    let parsed: AccountingPrintSettings | null = null;
    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data: AccountingPrintSettings = {
      ...getDefaultSettings(),
      ...(parsed || {}),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading accounting print settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load accounting print settings",
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

    const body = (await request.json()) as Partial<AccountingPrintSettings>;
    const current = getDefaultSettings();

    const existing = await prisma.setting.findFirst({
      where: { key: SETTING_KEY, userId: targetUserId as any },
    });

    let existingParsed = {} as AccountingPrintSettings;
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: AccountingPrintSettings = {
      proposal: {
        ...current.proposal,
        ...(existingParsed.proposal || {}),
        ...(body.proposal || {}),
      },
      invoice: {
        ...current.invoice,
        ...(existingParsed.invoice || {}),
        ...(body.invoice || {}),
      },
      bill: {
        ...current.bill,
        ...(existingParsed.bill || {}),
        ...(body.bill || {}),
      },
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
    console.error("Error saving accounting print settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save accounting print settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
