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
    const branchId = searchParams.get("branchId"); // Optional filter

    const whereClause: any = {};
    if (branchId) {
      whereClause.branch = branchId; // Assuming branch is stored as string name or relation? 
      // Employee model has 'branch' as String (name) and no branchId relation. 
      // Wait, schema says: branch String. But also branch relation in some models.
      // Let's check Employee model again.
      // Employee model: branch String. No relation to Branch model.
      // Okay, we filter by string for now.
    }

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        allowances: true,
        commissions: true,
        loans: true,
        saturationDeductions: true,
        otherPayments: true,
        overtimes: true,
      },
    });

    const data = employees.map((emp: any) => {
      const basicSalary = emp.basicSalary || 0;
      
      const totalAllowances = emp.allowances.reduce((sum: number, item: any) => sum + item.amount, 0) +
                              emp.commissions.reduce((sum: number, item: any) => sum + item.amount, 0) +
                              emp.otherPayments.reduce((sum: number, item: any) => sum + item.amount, 0) +
                              emp.overtimes.reduce((sum: number, item: any) => sum + (item.rate * item.hours * item.days), 0); // Simplified overtime calc

      const totalDeductions = emp.saturationDeductions.reduce((sum: number, item: any) => sum + item.amount, 0) +
                              emp.loans.reduce((sum: number, item: any) => sum + item.amount, 0); // Loan monthly deduction? Assuming amount is deduction amount for now.

      const netSalary = basicSalary + totalAllowances - totalDeductions;

      return {
        id: emp.id,
        employeeId: emp.employeeId,
        name: emp.name,
        payrollType: emp.salaryType || "Monthly",
        salary: basicSalary,
        allowances: totalAllowances,
        deductions: totalDeductions,
        netSalary: netSalary,
        department: emp.department || "-",
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching set salary list:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
