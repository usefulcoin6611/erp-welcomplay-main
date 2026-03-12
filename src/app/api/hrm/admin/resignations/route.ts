import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  employeeId: z.string().min(1),
  noticeDate: z.string().min(1),
  lastWorkingDate: z.string().min(1),
  reason: z.string().optional(),
});

function toRow(r: { id: string; employeeId: string; noticeDate: Date; lastWorkingDate: Date; reason: string | null; employee: { name: string } }) {
  return {
    id: r.id,
    employeeId: r.employeeId,
    employeeName: r.employee.name,
    noticeDate: r.noticeDate.toISOString().split("T")[0],
    lastWorkingDate: r.lastWorkingDate.toISOString().split("T")[0],
    reason: r.reason ?? "",
  };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const items = await prisma.hrmResignation.findMany({
      include: { employee: { select: { name: true } } },
      orderBy: { noticeDate: "desc" },
    });
    return NextResponse.json({ success: true, data: items.map(toRow) });
  } catch (error) {
    console.error("Error fetching resignations:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch resignations" }, { status: 500 });
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
    const item = await prisma.hrmResignation.create({
      data: {
        employeeId: parsed.data.employeeId,
        noticeDate: new Date(parsed.data.noticeDate),
        lastWorkingDate: new Date(parsed.data.lastWorkingDate),
        reason: parsed.data.reason?.trim() || null,
      },
      include: { employee: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, message: "Resignation created", data: toRow(item) });
  } catch (error) {
    console.error("Error creating resignation:", error);
    return NextResponse.json({ success: false, message: "Failed to create resignation" }, { status: 500 });
  }
}
