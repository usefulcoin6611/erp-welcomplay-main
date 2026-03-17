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

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // YYYY-MM
    const employeeId = searchParams.get("employeeId");

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const whereClause: any = {
      employee: {
        ownerId: companyId,
      },
    };
    if (month) {
      whereClause.salaryMonth = month;
    }
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    const payslips = await prisma.payslip.findMany({
      where: whereClause,
      include: {
        employee: true,
        payslipType: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: payslips });
  } catch (error: any) {
    console.error("Error fetching payslips:", error);
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

    const body = await request.json();
    const { month, year } = body; // month: 1-12, year: 202X

    if (!month || !year) {
      return NextResponse.json(
        { success: false, message: "Month and Year are required" },
        { status: 400 }
      );
    }

    const salaryMonth = `${year}-${String(month).padStart(2, "0")}`;

    const { id: userId, role, ownerId: sessionOwnerId } = session.user as any;
    const companyId = role === "company" ? userId : sessionOwnerId;

    // Check if already generated for this company
    const existingCount = await prisma.payslip.count({
      where: { 
        salaryMonth,
        employee: {
          ownerId: companyId
        }
      },
    });

    if (existingCount > 0) {
      return NextResponse.json(
        { success: false, message: `Payslips for ${salaryMonth} already exist.` },
        { status: 400 }
      );
    }

    const employees = await prisma.employee.findMany({
      where: { 
        isActive: true,
        ownerId: companyId
      },
    });

    const payslipsData = employees.map((emp: any) => {
      const basicSalary = emp.basicSalary || 0;
      const allowance = 0;
      const commission = 0;
      const otherPayment = 0;
      const overtime = 0;
      const loan = 0;
      const saturationDeduction = 0;
      const netSalary = basicSalary + allowance + commission + otherPayment + overtime - loan - saturationDeduction;

      return {
        employeeId: emp.id,
        salaryMonth,
        basicSalary,
        allowance,
        commission,
        loan,
        saturationDeduction,
        otherPayment,
        overtime,
        netSalary,
        status: 0, // Unpaid
      };
    });

    if (payslipsData.length === 0) {
      return NextResponse.json(
        { success: false, message: "No active employees found to generate payslips." },
        { status: 400 }
      );
    }

    await prisma.payslip.createMany({
      data: payslipsData,
    });

    return NextResponse.json({ success: true, message: `Generated ${payslipsData.length} payslips for ${salaryMonth}` });
  } catch (error: any) {
    console.error("Error generating payslips:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
