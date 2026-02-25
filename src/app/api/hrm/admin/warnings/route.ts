import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  employeeId: z.string().min(1),
  warningById: z.string().min(1),
  subject: z.string().min(1),
  warningDate: z.string().min(1),
  description: z.string().optional(),
});

function toRow(w: {
  id: string;
  employeeId: string;
  warningById: string;
  subject: string;
  warningDate: Date;
  description: string | null;
  employee: { name: string };
  warningBy: { name: string };
}) {
  return {
    id: w.id,
    employeeId: w.employeeId,
    employeeName: w.employee.name,
    warningById: w.warningById,
    warningBy: w.warningBy.name,
    subject: w.subject,
    warningDate: w.warningDate.toISOString().split("T")[0],
    description: w.description ?? "",
  };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const items = await prisma.hrmWarning.findMany({
      include: {
        employee: { select: { name: true } },
        warningBy: { select: { name: true } },
      },
      orderBy: { warningDate: "desc" },
    });
    return NextResponse.json({ success: true, data: items.map(toRow) });
  } catch (error) {
    console.error("Error fetching warnings:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch warnings" }, { status: 500 });
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
    const [emp, wb] = await Promise.all([
      prisma.employee.findUnique({ where: { id: parsed.data.employeeId } }),
      prisma.employee.findUnique({ where: { id: parsed.data.warningById } }),
    ]);
    if (!emp) return NextResponse.json({ success: false, message: "Employee not found" }, { status: 400 });
    if (!wb) return NextResponse.json({ success: false, message: "Warning by (employee) not found" }, { status: 400 });
    const item = await prisma.hrmWarning.create({
      data: {
        employeeId: parsed.data.employeeId,
        warningById: parsed.data.warningById,
        subject: parsed.data.subject,
        warningDate: new Date(parsed.data.warningDate),
        description: parsed.data.description?.trim() || null,
      },
      include: {
        employee: { select: { name: true } },
        warningBy: { select: { name: true } },
      },
    });
    return NextResponse.json({ success: true, message: "Warning created", data: toRow(item) });
  } catch (error) {
    console.error("Error creating warning:", error);
    return NextResponse.json({ success: false, message: "Failed to create warning" }, { status: 500 });
  }
}
