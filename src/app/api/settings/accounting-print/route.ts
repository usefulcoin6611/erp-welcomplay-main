import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const body = (await request.json()) as Partial<AccountingPrintSettings>;
    const current = getDefaultSettings();

    const merged: AccountingPrintSettings = {
      proposal: {
        ...current.proposal,
        ...(body.proposal || {}),
      },
      invoice: {
        ...current.invoice,
        ...(body.invoice || {}),
      },
      bill: {
        ...current.bill,
        ...(body.bill || {}),
      },
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
