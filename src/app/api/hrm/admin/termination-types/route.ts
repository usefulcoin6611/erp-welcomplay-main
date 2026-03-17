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

    const types = await prisma.terminationType.findMany({
      where: { ownerId: companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return NextResponse.json({ success: true, data: types });
  } catch (error) {
    console.error("Error fetching termination types:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch termination types" }, { status: 500 });
  }
}
