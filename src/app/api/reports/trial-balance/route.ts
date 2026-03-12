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
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(`${startDate}T00:00:00.000Z`);
    if (endDate) dateFilter.lte = new Date(`${endDate}T23:59:59.999Z`);

    // Fetch all accounts for the branch
    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        branchId: branchId,
      },
      include: {
        journalLines: {
          where: {
            journalEntry: {
              branchId: branchId,
              date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
            },
          },
          select: {
            debit: true,
            credit: true,
          },
        },
      },
      orderBy: {
        code: "asc",
      },
    });

    const structuredData: any = {
      Assets: [],
      Liabilities: [],
      Equity: [],
      Income: [],
      "Costs of Goods Sold": [],
      Expenses: [],
    };

    accounts.forEach((account) => {
      const type = account.type;
      const totalDebit = account.journalLines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = account.journalLines.reduce((sum, line) => sum + line.credit, 0);

      if (totalDebit !== 0 || totalCredit !== 0) {
        if (structuredData[type]) {
          structuredData[type].push({
            account_id: account.id,
            account_code: account.code,
            account_name: account.name,
            totalDebit,
            totalCredit,
          });
        }
      }
    });

    return NextResponse.json({ success: true, data: structuredData });
  } catch (error) {
    console.error("Error generating trial balance:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
