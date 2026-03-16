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

    const payouts = await prisma.payoutRequest.findMany({
      where: {
        branchId: branchId,
      },
      orderBy: {
        requestedDate: "desc",
      },
    });

    return NextResponse.json({ success: true, data: payouts });
  } catch (error) {
    console.error("Referral payouts error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = ((session.user as any).branchId as string | null) || null;

    if (!branchId) {
       return NextResponse.json({ success: false, message: "Branch ID not found" }, { status: 400 });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { name: true }
    });

    const branchName = branch?.name || "Unknown Company";

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 });
    }

    const payout = await prisma.payoutRequest.create({
      data: {
        branchId,
        companyName: branchName,
        requestedAmount: amount,
        status: "In Progress",
      },
    });

    return NextResponse.json({ success: true, data: payout });
  } catch (error) {
    console.error("Referral payouts POST error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
