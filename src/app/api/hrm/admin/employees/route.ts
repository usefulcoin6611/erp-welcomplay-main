import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { checkPlanStatus } from "@/lib/plan-server";

export async function GET() {
  try {
    const { authorized, response } = await checkPlanStatus();
    if (!authorized) return response!;

    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}
