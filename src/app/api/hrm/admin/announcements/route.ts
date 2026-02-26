import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  branch: z.string().min(1),
  department: z.string().min(1),
  employeeId: z.string().min(1).optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  description: z.string().optional(),
});

function toRow(a: {
  id: string;
  title: string;
  branch: string;
  department: string;
  employeeId: string | null;
  startDate: Date;
  endDate: Date;
  description: string | null;
  employee?: { name: string } | null;
}) {
  const status = new Date(a.endDate) >= new Date() ? "Active" : "Expired";
  return {
    id: a.id,
    title: a.title,
    branch: a.branch,
    department: a.department,
    employeeId: a.employeeId,
    employeeName: a.employee?.name ?? "",
    startDate: a.startDate.toISOString().split("T")[0],
    endDate: a.endDate.toISOString().split("T")[0],
    description: a.description ?? "",
    status,
  };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const items = await prisma.hrmAnnouncement.findMany({
      include: { employee: { select: { name: true } } },
      orderBy: { startDate: "desc" },
    });
    return NextResponse.json({ success: true, data: items.map(toRow) });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch announcements" }, { status: 500 });
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
    // Optional targeted employee
    if (parsed.data.employeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
      if (!emp) {
        return NextResponse.json({ success: false, message: "Employee not found" }, { status: 400 });
      }
    }
    const item = await prisma.hrmAnnouncement.create({
      data: {
        title: parsed.data.title,
        branch: parsed.data.branch,
        department: parsed.data.department,
        employeeId: parsed.data.employeeId ?? null,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        description: parsed.data.description?.trim() || null,
      },
      include: { employee: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, message: "Announcement created", data: toRow(item) });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ success: false, message: "Failed to create announcement" }, { status: 500 });
  }
}
