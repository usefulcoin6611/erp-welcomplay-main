import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { getSetting, saveSetting } from "@/lib/settings";

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

/**
 * PUT /api/settings/system
 * Simpan pengaturan sistem
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { role, id: userId } = session.user as any;
    const targetUserId = role === "super admin" ? null : userId;

    const body = (await request.json()) as Partial<SystemSettings>;
    const current = getDefaultSettings();

    const existing = await getSetting(SETTING_KEY, targetUserId);

    let existingParsed = {} as SystemSettings;
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

    await saveSetting(SETTING_KEY, JSON.stringify(merged), targetUserId);
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
