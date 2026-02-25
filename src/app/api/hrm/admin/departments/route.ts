import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const employees = await prisma.employee.findMany({
      select: { department: true },
    });
    const deptSet = new Set<string>(["All"]);
    employees.forEach((e) => e.department && deptSet.add(e.department));
    const departments = Array.from(deptSet).sort().map((name) => ({ id: name, name }));
    return NextResponse.json({ success: true, data: departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch departments" }, { status: 500 });
  }
}
