import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const results: any = {
      branchesUpdated: 0,
      usersUpdated: 0,
      employeesUpdated: 0,
    };

    // 1. Fix Company Users (Set ownerId = id)
    const companies = await prisma.user.findMany({
      where: { role: "company", ownerId: null },
    });

    for (const company of companies) {
      await prisma.user.update({
        where: { id: company.id },
        data: { ownerId: company.id },
      });
      results.usersUpdated++;

      // 2. Fix their Branch
      if (company.branchId) {
        await (prisma as any).branch.update({
          where: { id: company.branchId },
          data: { ownerId: company.id },
        });
        results.branchesUpdated++;
      }
    }

    // 3. Fix Employees (Find their company and set ownerId)
    const employees = await prisma.user.findMany({
      where: { role: "employee", ownerId: null },
    });

    for (const emp of employees) {
      // Try to find by branchId
      if (emp.branchId) {
        const branch: any = await (prisma as any).branch.findUnique({
          where: { id: emp.branchId },
          select: { ownerId: true },
        });
        if (branch?.ownerId) {
          await prisma.user.update({
            where: { id: emp.id },
            data: { ownerId: branch.ownerId },
          });
          results.employeesUpdated++;
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
