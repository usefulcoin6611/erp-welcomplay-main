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
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const accountIdParam = searchParams.get("accountId");
    const categoryParam = searchParams.get("category");
    const search = searchParams.get("search") || "";

    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const pageSizeParam = parseInt(searchParams.get("pageSize") || "50", 10);
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const pageSize = Number.isNaN(pageSizeParam) || pageSizeParam < 1 ? 50 : pageSizeParam;

    const dateFilter: any = {};
    if (startDateParam) {
      dateFilter.gte = new Date(`${startDateParam}T00:00:00.000Z`);
    }
    if (endDateParam) {
      dateFilter.lte = new Date(`${endDateParam}T23:59:59.999Z`);
    }

    let selectedBankChartAccountId: string | undefined;

    if (accountIdParam && accountIdParam !== "all") {
      const bankAccount = await prisma.bankAccount.findFirst({
        where: {
          id: accountIdParam,
          branchId,
        },
      });

      if (!bankAccount) {
        return NextResponse.json({
          success: true,
          data: {
            items: [],
            totalCount: 0,
            revenueAccounts: [],
            paymentAccounts: [],
          },
        });
      }

      selectedBankChartAccountId = bankAccount.chartAccountId;
    }

    const journalEntryFilter: any = {
      branchId,
      date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
    };

    const linesWhere: any = {
      journalEntry: {
        is: journalEntryFilter,
      },
      account: {
        branchId,
        id: selectedBankChartAccountId ? selectedBankChartAccountId : undefined,
      },
    };

    if (categoryParam && categoryParam !== "all") {
      if (categoryParam === "revenue") {
        linesWhere.account.type = "Income";
      } else if (categoryParam === "payment") {
        linesWhere.account.type = {
          in: ["Expenses", "Costs of Goods Sold", "Liabilities"],
        };
      }
    }

    if (search) {
      linesWhere.OR = [
        {
          journalEntry: {
            is: {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          journalEntry: {
            is: {
              reference: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [lines, totalCount] = await Promise.all([
      prisma.journalLine.findMany({
        where: linesWhere,
        include: {
          journalEntry: true,
          account: true,
        },
        orderBy: {
          journalEntry: {
            date: "desc",
          },
        },
        skip,
        take,
      }),
      prisma.journalLine.count({
        where: linesWhere,
      }),
    ]);

    const statementData = lines.map((line) => {
      const amount = line.debit !== 0 ? line.debit : line.credit !== 0 ? -line.credit : 0;
      const date = line.journalEntry.date.toISOString().split("T")[0];
      const description =
        line.journalEntry.description ||
        line.description ||
        line.journalEntry.reference ||
        line.journalEntry.journalId;
      const type =
        line.account.type === "Income"
          ? "revenue"
          : line.account.type === "Assets"
          ? "revenue"
          : "payment";

      return {
        id: line.id,
        date,
        amount,
        description,
        type,
      };
    });

    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        branchId,
        journalLines: {
          some: {
            journalEntry: {
              is: {
                branchId,
                date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
              },
            },
          },
        },
      },
      include: {
        bankAccounts: true,
        journalLines: {
          where: {
            journalEntry: {
              is: {
                branchId,
                date: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
              },
            },
          },
          select: {
            debit: true,
            credit: true,
          },
        },
      },
    });

    const revenueAccounts: {
      id: string;
      holderName: string;
      bankName?: string;
      total: number;
      type: "revenue";
    }[] = [];

    const paymentAccounts: {
      id: string;
      holderName: string;
      bankName?: string;
      total: number;
      type: "payment";
    }[] = [];

    accounts.forEach((account) => {
      const totalDebit = account.journalLines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = account.journalLines.reduce((sum, l) => sum + l.credit, 0);
      const isIncomeLike = account.type === "Income" || account.type === "Assets";
      const net = isIncomeLike ? totalDebit - totalCredit : totalCredit - totalDebit;

      if (net === 0) {
        return;
      }

      const bankAccount = account.bankAccounts[0];
      const holderName = bankAccount ? bankAccount.holderName : account.name;
      const bankName = bankAccount ? bankAccount.bank : undefined;

      if (isIncomeLike) {
        revenueAccounts.push({
          id: account.id,
          holderName,
          bankName,
          total: net,
          type: "revenue",
        });
      } else {
        paymentAccounts.push({
          id: account.id,
          holderName,
          bankName,
          total: net,
          type: "payment",
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        items: statementData,
        totalCount,
        revenueAccounts,
        paymentAccounts,
      },
    });
  } catch (error) {
    console.error("Error generating account statement:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
