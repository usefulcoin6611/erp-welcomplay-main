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

    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        employeeId: true,
        name: true,
        branch: true,
        department: true,
        designation: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: employees,
    });
  } catch (error: any) {
    console.error("Error fetching employees for assets:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data employee" },
      { status: 500 },
    );
  }
}

