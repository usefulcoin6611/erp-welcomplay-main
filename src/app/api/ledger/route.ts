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

    const branchId = (session.user as any).branchId;
    if (!branchId) {
      return NextResponse.json({ error: "User has no assigned branch" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!accountId) {
      return NextResponse.json({ success: false, message: "Account ID is required" }, { status: 400 });
    }

    // Build date filters
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    // Fetch account details
    const account = await prisma.chartOfAccount.findFirst({
      where: { id: accountId, branchId: branchId },
    });

    if (!account) {
      return NextResponse.json({ success: false, message: "Account not found or access denied" }, { status: 404 });
    }

    // Fetch journal lines for this account
    const ledgerLines = await prisma.journalLine.findMany({
      where: {
        accountId,
        journalEntry: {
          branchId: branchId,
          date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        },
      },
      include: {
        journalEntry: true,
      },
      orderBy: {
        journalEntry: {
          date: "asc",
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        account,
        lines: ledgerLines.map(line => ({
          id: line.id,
          date: line.journalEntry.date,
          reference: line.journalEntry.reference || line.journalEntry.journalId,
          description: line.description || line.journalEntry.description,
          debit: line.debit,
          credit: line.credit,
          journalId: line.journalEntry.id,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching ledger:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
