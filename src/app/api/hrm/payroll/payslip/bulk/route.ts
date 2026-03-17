import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const { salaryMonth } = body as { salaryMonth?: string };

    if (!salaryMonth || typeof salaryMonth !== "string") {
      return NextResponse.json(
        { success: false, message: "salaryMonth (YYYY-MM) is required" },
        { status: 400 },
      );
    }

    const { id: userId, role, ownerId: sessionOwnerId } = session.user as any;
    const companyId = role === "company" ? userId : sessionOwnerId;

    const result = await prisma.payslip.updateMany({
      where: {
        salaryMonth,
        status: 0, // Unpaid only
        employee: {
          ownerId: companyId
        }
      },
      data: {
        status: 1, // Paid
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No unpaid payslips found for the selected period.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Bulk payment applied to ${result.count} payslips for ${salaryMonth}.`,
    });
  } catch (error: any) {
    console.error("Error in bulk payslip payment:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

