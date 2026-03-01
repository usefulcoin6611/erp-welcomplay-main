import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SETTING_KEY = "system_company_settings";

type CompanySettings = {
  company_name: string;
  company_address: string;
  company_city: string;
  company_state: string;
  company_zipcode: string;
  company_country: string;
  company_telephone: string;
  registration_number: string;
  company_start_time: string;
  company_end_time: string;
  timezone: string;
};

function getDefaultSettings(): CompanySettings {
  return {
    company_name: "",
    company_address: "",
    company_city: "",
    company_state: "",
    company_zipcode: "",
    company_country: "",
    company_telephone: "",
    registration_number: "",
    company_start_time: "09:00",
    company_end_time: "18:00",
    timezone: "UTC",
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

    let parsed: CompanySettings | null = null;

    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading company settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load company settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<CompanySettings>;
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

    const merged: CompanySettings = {
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
    console.error("Error saving company settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save company settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
