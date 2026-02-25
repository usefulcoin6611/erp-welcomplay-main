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
      const totalAllowances =
        (emp.allowances?.reduce((s: number, a: any) => s + Number(a.amount ?? 0), 0) ?? 0) +
        (emp.commissions?.reduce((s: number, c: any) => s + Number(c.amount ?? 0), 0) ?? 0) +
        (emp.otherPayments?.reduce((s: number, o: any) => s + Number(o.amount ?? 0), 0) ?? 0) +
        (emp.overtimes?.reduce((s: number, o: any) => s + (Number(o.days ?? 0) * Number(o.hours ?? 0) * Number(o.rate ?? 0)), 0) ?? 0);
      const totalDeductions =
        (emp.saturationDeductions?.reduce((s: number, d: any) => s + Number(d.amount ?? 0), 0) ?? 0) +
        (emp.loans?.reduce((s: number, l: any) => s + Number(l.amount ?? 0), 0) ?? 0);
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
