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

    // 1. Fetch relevant accounts (Assets, Liabilities, Equity)
    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        branchId: branchId, // Filter by branch
        type: {
          in: ["Assets", "Liabilities", "Equity"],
        },
      },
      include: {
        journalLines: {
          where: {
            journalEntry: {
              branchId: branchId, // Ensure lines are also from the same branch
              date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
            },
          },
          select: {
            debit: true,
            credit: true,
          },
        },
      },
    });

    // 2. Fetch Income and Expenses for Current Year Earnings
    // For Balance Sheet, Current Year Earnings is (Income - Costs of Goods Sold - Expenses) 
    // from the beginning of time up to the endDate
    const earningsDateFilter: any = {};
    if (endDate) earningsDateFilter.lte = new Date(`${endDate}T23:59:59.999Z`);

    const plAccounts = await prisma.chartOfAccount.findMany({
      where: {
        branchId: branchId, // Filter by branch
        type: {
          in: ["Income", "Costs of Goods Sold", "Expenses"],
        },
      },
      include: {
        journalLines: {
          where: {
            journalEntry: {
              branchId: branchId, // Ensure lines are also from the same branch
              date: Object.keys(earningsDateFilter).length > 0 ? earningsDateFilter : undefined,
            },
          },
          select: {
            debit: true,
            credit: true,
          },
        },
      },
    });

    let currentYearEarnings = 0;
    plAccounts.forEach((acc) => {
      const totalDebit = acc.journalLines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = acc.journalLines.reduce((sum, line) => sum + line.credit, 0);
      
      if (acc.type === "Income") {
        currentYearEarnings += (totalCredit - totalDebit);
      } else {
        // Costs of Goods Sold and Expenses
        currentYearEarnings -= (totalDebit - totalCredit);
      }
    });

    // 3. Structure the data
    const structuredData: any = {
      Assets: [],
      Liabilities: [],
      Equity: [],
    };

    // Group accounts by type and subType
    const grouped = accounts.reduce((acc: any, account) => {
      const type = account.type as string;
      const subType = account.subType || "Other";
      
      if (!acc[type]) acc[type] = {};
      if (!acc[type][subType]) acc[type][subType] = [];
      
      const totalDebit = account.journalLines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = account.journalLines.reduce((sum, line) => sum + line.credit, 0);
      
      // Net amount calculation based on account type
      let netAmount = 0;
      if (type === "Assets") {
        netAmount = totalDebit - totalCredit;
      } else {
        // Liabilities and Equity
        netAmount = totalCredit - totalDebit;
      }

      if (netAmount !== 0) {
        acc[type][subType].push({
          account_id: account.id,
          account_code: account.code,
          account_name: account.name,
          netAmount,
        });
      }
      
      return acc;
    }, {});

    // Convert grouped object to the format expected by frontend
    Object.keys(grouped).forEach((type) => {
      Object.keys(grouped[type]).forEach((subType) => {
        structuredData[type].push({
          subType,
          account: [grouped[type][subType]],
        });
      });
    });

    // Add Current Year Earnings to Equity
    if (currentYearEarnings !== 0) {
      const equityGroup = structuredData.Equity.find((g: any) => g.subType === "Equity") 
                        || structuredData.Equity.find((g: any) => g.subType === "Other");
      
      const earningsRecord = {
        account_id: "current-year-earnings",
        account_code: "-",
        account_name: "Current Year Earnings",
        netAmount: currentYearEarnings,
      };

      if (equityGroup) {
        equityGroup.account[0].push(earningsRecord);
      } else {
        structuredData.Equity.push({
          subType: "Equity",
          account: [[earningsRecord]],
        });
      }
    }

    return NextResponse.json({ success: true, data: structuredData });
  } catch (error) {
    console.error("Error generating balance sheet:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
