import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  employeeId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  purpose: z.string().min(1),
  country: z.string().min(1),
  description: z.string().optional(),
});

function toRow(t: { id: string; employeeId: string; startDate: Date; endDate: Date; purpose: string; country: string; description: string | null; employee: { name: string } }) {
  return {
    id: t.id,
    employeeId: t.employeeId,
    employeeName: t.employee.name,
    startDate: t.startDate.toISOString().split("T")[0],
    endDate: t.endDate.toISOString().split("T")[0],
    purpose: t.purpose,
    country: t.country,
    description: t.description ?? "",
  };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const items = await prisma.hrmTravel.findMany({
      where: {
        employee: {
          ownerId: companyId,
        },
      },
      include: { employee: { select: { name: true } } },
      orderBy: { startDate: "desc" },
    });
    return NextResponse.json({ success: true, data: items.map(toRow) });
  } catch (error) {
    console.error("Error fetching travel:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch travel" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const emp = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
    if (!emp) return NextResponse.json({ success: false, message: "Employee not found" }, { status: 400 });
    const item = await prisma.hrmTravel.create({
      data: {
        employeeId: parsed.data.employeeId,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        purpose: parsed.data.purpose,
        country: parsed.data.country,
        description: parsed.data.description?.trim() || null,
      },
      include: { employee: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, message: "Trip created", data: toRow(item) });
  } catch (error) {
    console.error("Error creating travel:", error);
    return NextResponse.json({ success: false, message: "Failed to create trip" }, { status: 500 });
  }
}
