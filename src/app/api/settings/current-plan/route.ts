import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/settings/current-plan
 * Returns the current authenticated user's subscription plan (for company role).
 * Used by settings subscription-plan tab to show which plan is active.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { plan: true, planExpireDate: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        plan: user.plan ?? null,
        planExpireDate: user.planExpireDate?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error("Error fetching current plan:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch current plan" },
      { status: 500 },
    );
  }
}
