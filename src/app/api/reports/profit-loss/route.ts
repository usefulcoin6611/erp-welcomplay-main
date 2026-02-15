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

    // Fetch Income, COGS, and Expenses
    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        branchId: branchId,
        type: {
          in: ["Income", "Costs of Goods Sold", "Expenses"],
        },
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

    const grouped: any = {
      Income: [],
      "Costs of Goods Sold": [],
      Expenses: [],
    };

    accounts.forEach((account) => {
      const type = account.type;
      const totalDebit = account.journalLines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = account.journalLines.reduce((sum, line) => sum + line.credit, 0);

      let netAmount = 0;
      if (type === "Income") {
        netAmount = totalCredit - totalDebit;
      } else {
        // COGS and Expenses
        netAmount = totalDebit - totalCredit;
      }

      if (netAmount !== 0) {
        grouped[type].push({
          account_id: account.id,
          account_code: account.code,
          account_name: account.name,
          netAmount,
        });
      }
    });

    // Format for frontend
    const structuredData = Object.keys(grouped).map((type) => {
      const accountsInType = grouped[type];
      const totalForType = accountsInType.reduce((sum: number, acc: any) => sum + acc.netAmount, 0);
      
      return {
        Type: type,
        account: [
          [
            ...accountsInType,
            {
              account_id: 0,
              account_code: "",
              account_name: `Total ${type}`,
              netAmount: totalForType,
              account: "",
            },
          ],
        ],
      };
    });

    return NextResponse.json({ success: true, data: structuredData });
  } catch (error) {
    console.error("Error generating profit and loss:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
