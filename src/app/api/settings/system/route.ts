import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTING_KEY = "system_general_settings";

type SystemSettings = {
  site_date_format: string;
  site_time_format: string;
  customer_prefix: string;
  proposal_prefix: string;
  bill_prefix: string;
  purchase_prefix: string;
  journal_prefix: string;
  vendor_prefix: string;
  invoice_prefix: string;
  quotation_prefix: string;
  pos_prefix: string;
  expense_prefix: string;
  display_shipping: boolean;
  footer_title: string;
  footer_note: string;
};

function getDefaultSettings(): SystemSettings {
  return {
    site_date_format: "M j, Y",
    site_time_format: "g:i A",
    customer_prefix: "#CUST",
    proposal_prefix: "#PROP",
    bill_prefix: "#BILL",
    purchase_prefix: "#PUR",
    journal_prefix: "#JUR",
    vendor_prefix: "#VEND",
    invoice_prefix: "#INVO",
    quotation_prefix: "#QUO",
    pos_prefix: "#POS",
    expense_prefix: "#EXP",
    display_shipping: true,
    footer_title: "",
    footer_note: "",
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

    let parsed: SystemSettings | null = null;

    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading system settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load system settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<SystemSettings>;
    const current = getDefaultSettings();

    const existing = await prisma.setting.findUnique({
      where: { key: SETTING_KEY },
    });

    let existingParsed = {};
    if (existing) {
      try {
        existingParsed = JSON.parse(existing.value);
      } catch (e) {
        // ignore
      }
    }

    const merged: SystemSettings = {
      ...current,
      ...existingParsed,
      ...body,
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
    console.error("Error saving system settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save system settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
