import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  employeeId: z.string().min(1),
  branch: z.string().min(1),
  department: z.string().min(1),
  transferDate: z.string().min(1),
  description: z.string().optional(),
});

function toRow(t: { id: string; employeeId: string; branch: string; department: string; transferDate: Date; description: string | null; employee: { name: string } }) {
  return {
    id: t.id,
    employeeId: t.employeeId,
    employeeName: t.employee.name,
    branch: t.branch,
    department: t.department,
    transferDate: t.transferDate.toISOString().split("T")[0],
    description: t.description ?? "",
  };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const items = await prisma.hrmTransfer.findMany({
      where: {
        employee: {
          ownerId: companyId,
        },
      },
      include: { employee: { select: { name: true } } },
      orderBy: { transferDate: "desc" },
    });
    return NextResponse.json({ success: true, data: items.map(toRow) });
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch transfers" }, { status: 500 });
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

    const item = await prisma.hrmTransfer.create({
      data: {
        employeeId: parsed.data.employeeId,
        branch: parsed.data.branch,
        department: parsed.data.department,
        transferDate: new Date(parsed.data.transferDate),
        description: parsed.data.description?.trim() || null,
      },
      include: { employee: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, message: "Transfer created", data: toRow(item) });
  } catch (error) {
    console.error("Error creating transfer:", error);
    return NextResponse.json({ success: false, message: "Failed to create transfer" }, { status: 500 });
  }
}
