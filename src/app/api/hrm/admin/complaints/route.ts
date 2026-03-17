import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  employeeFromId: z.string().min(1),
  complaintAgainstId: z.string().min(1),
  title: z.string().min(1),
  date: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["Pending", "In Progress", "Resolved"]).optional(),
});

function toRow(c: {
  id: string;
  employeeFromId: string;
  complaintAgainstId: string;
  title: string;
  date: Date;
  description: string | null;
  status: string;
  employeeFrom: { name: string };
  complaintAgainst: { name: string };
}) {
  return {
    id: c.id,
    employeeFromId: c.employeeFromId,
    employeeFrom: c.employeeFrom.name,
    complaintAgainstId: c.complaintAgainstId,
    complaintAgainst: c.complaintAgainst.name,
    title: c.title,
    date: c.date.toISOString().split("T")[0],
    description: c.description ?? "",
    status: c.status,
  };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const items = await prisma.hrmComplaint.findMany({
      where: {
        employeeFrom: {
          ownerId: companyId,
        },
      },
      include: {
        employeeFrom: { select: { name: true } },
        complaintAgainst: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ success: true, data: items.map(toRow) });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch complaints" }, { status: 500 });
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
    const [from, against] = await Promise.all([
      prisma.employee.findUnique({ where: { id: parsed.data.employeeFromId } }),
      prisma.employee.findUnique({ where: { id: parsed.data.complaintAgainstId } }),
    ]);
    if (!from) return NextResponse.json({ success: false, message: "Employee (from) not found" }, { status: 400 });
    if (!against) return NextResponse.json({ success: false, message: "Employee (against) not found" }, { status: 400 });
    const item = await prisma.hrmComplaint.create({
      data: {
        employeeFromId: parsed.data.employeeFromId,
        complaintAgainstId: parsed.data.complaintAgainstId,
        title: parsed.data.title,
        date: new Date(parsed.data.date),
        description: parsed.data.description?.trim() || null,
        status: parsed.data.status ?? "Pending",
      },
      include: {
        employeeFrom: { select: { name: true } },
        complaintAgainst: { select: { name: true } },
      },
    });
    return NextResponse.json({ success: true, message: "Complaint created", data: toRow(item) });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json({ success: false, message: "Failed to create complaint" }, { status: 500 });
  }
}
