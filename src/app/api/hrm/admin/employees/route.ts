import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { checkPlanStatus } from "@/lib/plan-server";

export async function GET() {
  try {
    const { authorized, response } = await checkPlanStatus();
    if (!authorized) return response!;

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const employees = await prisma.employee.findMany({
      where: { 
        isActive: true,
        ownerId: companyId 
      },
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
