import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    let settings = await prisma.referralSetting.findFirst();

    if (!settings) {
      // Create default settings if not exists
      settings = await prisma.referralSetting.create({
        data: {
          isEnable: true,
          percentage: 10,
          minimumThreshold: 50000,
          guideline: "Refer global exports and earn 10% per paid signup!",
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Referral settings error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
