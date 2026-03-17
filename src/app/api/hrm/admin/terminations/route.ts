import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  employeeId: z.string().min(1),
  terminationTypeId: z.string().min(1),
  noticeDate: z.string().min(1),
  terminationDate: z.string().min(1),
  description: z.string().optional(),
});

function toRow(t: {
  id: string;
  employeeId: string;
  terminationTypeId: string;
  noticeDate: Date;
  terminationDate: Date;
  description: string | null;
  employee: { name: string };
  terminationType: { name: string };
}) {
  return {
    id: t.id,
    employeeId: t.employeeId,
    employeeName: t.employee.name,
    terminationTypeId: t.terminationTypeId,
    terminationType: t.terminationType.name,
    noticeDate: t.noticeDate.toISOString().split("T")[0],
    terminationDate: t.terminationDate.toISOString().split("T")[0],
    description: t.description ?? "",
  };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const items = await prisma.hrmTermination.findMany({
      where: {
        employee: {
          ownerId: companyId,
        },
      },
      include: {
        employee: { select: { name: true } },
        terminationType: { select: { name: true } },
      },
      orderBy: { terminationDate: "desc" },
    });
    return NextResponse.json({ success: true, data: items.map(toRow) });
  } catch (error) {
    console.error("Error fetching terminations:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch terminations" }, { status: 500 });
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
    const [emp, tt] = await Promise.all([
      prisma.employee.findUnique({ where: { id: parsed.data.employeeId } }),
      prisma.terminationType.findUnique({ where: { id: parsed.data.terminationTypeId } }),
    ]);
    if (!emp) return NextResponse.json({ success: false, message: "Employee not found" }, { status: 400 });
    if (!tt) return NextResponse.json({ success: false, message: "Termination type not found" }, { status: 400 });
    const item = await prisma.hrmTermination.create({
      data: {
        employeeId: parsed.data.employeeId,
        terminationTypeId: parsed.data.terminationTypeId,
        noticeDate: new Date(parsed.data.noticeDate),
        terminationDate: new Date(parsed.data.terminationDate),
        description: parsed.data.description?.trim() || null,
      },
      include: {
        employee: { select: { name: true } },
        terminationType: { select: { name: true } },
      },
    });
    return NextResponse.json({ success: true, message: "Termination created", data: toRow(item) });
  } catch (error) {
    console.error("Error creating termination:", error);
    return NextResponse.json({ success: false, message: "Failed to create termination" }, { status: 500 });
  }
}
