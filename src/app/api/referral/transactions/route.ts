import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = ((session.user as any).branchId as string | null) || null;

    if (!branchId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const transactions = await prisma.referralTransaction.findMany({
      where: {
        referrerBranchId: branchId,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error("Referral transactions error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
