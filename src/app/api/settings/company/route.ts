import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

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
      // If no settings found, try to sync from user's branch (from wizard setup)
      if (userId) {
        const userWithBranch = await prisma.user.findUnique({
          where: { id: userId },
          include: { branch: true }
        });

        if (userWithBranch?.branch) {
          const b = userWithBranch.branch;
          return NextResponse.json({
            success: true,
            data: {
              ...getDefaultSettings(),
              company_name: b.name || "",
              company_address: b.address || "",
              company_telephone: b.phone || "",
            }
          });
        }
      }

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
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { role, id: userId } = session.user as any;
    const targetUserId = role === "super admin" ? null : userId;

    const body = (await request.json()) as Partial<CompanySettings>;
    const current = getDefaultSettings();

    const existing = await prisma.setting.findUnique({
      where: { key_userId: { key: SETTING_KEY, userId: targetUserId } },
    });

    let existingParsed = {} as CompanySettings;
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
      where: { key_userId: { key: SETTING_KEY, userId: targetUserId as any } },
      update: { value: JSON.stringify(merged) },
      create: {
        key: SETTING_KEY,
        userId: targetUserId,
        value: JSON.stringify(merged),
      },
    });

    // Sync back to Branch table as well
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { branchId: true }
      });
      
      if (user?.branchId) {
        await prisma.branch.update({
          where: { id: user.branchId },
          data: {
            name: merged.company_name,
            address: merged.company_address,
            phone: merged.company_telephone,
          }
        });
      }
    }

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
