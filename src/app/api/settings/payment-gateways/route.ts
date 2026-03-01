import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    const body = (await request.json()) as Partial<CompanyGatewaySettings>;
    const current = getDefaultSettings();
    const merged: CompanyGatewaySettings = {
      ...current,
      ...body,
      custom: body.custom ?? current.custom,
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
