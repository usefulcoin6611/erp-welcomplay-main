import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const branches = await prisma.branch.findMany({
      where: { ownerId: companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    const data = [{ id: "All Branches", name: "All Branches" }, ...branches];
    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch branches" }, { status: 500 });
  }
}
