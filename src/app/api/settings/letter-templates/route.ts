import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// We'll use a dynamic route parameter for the template type eventually,
// but for simplification or depending on how it's called, we might accept
// the template type in the body or query. Let's assume the frontend will send
// the specific letter templates they want to save along with the name.
// Actually, it's easier to store them as one big object or use query params.
// Let's store them as one object called system_letter_templates.

const SETTING_KEY = "system_letter_templates";

type LetterTemplates = {
  offer_letter: string;
  joining_letter: string;
  experience_certificate: string;
  noc: string;
};

function getDefaultSettings(): LetterTemplates {
  return {
    offer_letter: "",
    joining_letter: "",
    experience_certificate: "",
    noc: "",
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

    let parsed: LetterTemplates | null = null;

    try {
      parsed = JSON.parse(existing.value);
    } catch {
      parsed = null;
    }

    const data = { ...getDefaultSettings(), ...(parsed || {}) };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error loading letter templates:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load letter templates",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<LetterTemplates>;
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

    const merged: LetterTemplates = {
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
    console.error("Error saving letter templates:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save letter templates",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
