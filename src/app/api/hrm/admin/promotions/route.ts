import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  employeeId: z.string().min(1),
  designationId: z.string().min(1),
  title: z.string().min(1),
  promotionDate: z.string().min(1),
  description: z.string().optional(),
});

function toRow(p: { id: string; employeeId: string; designationId: string | null; title: string; promotionDate: Date; description: string | null; employee: { name: string }; designation: { name: string } | null }) {
  return {
    id: p.id,
    employeeId: p.employeeId,
    employeeName: p.employee.name,
    designationId: p.designationId,
    designationName: p.designation?.name ?? "",
    title: p.title,
    promotionDate: p.promotionDate.toISOString().split("T")[0],
    description: p.description ?? "",
  };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const items = await prisma.hrmPromotion.findMany({
      where: {
        employee: {
          ownerId: companyId,
        },
      },
      include: { employee: { select: { name: true } }, designation: { select: { name: true } } },
      orderBy: { promotionDate: "desc" },
    });
    return NextResponse.json({ success: true, data: items.map(toRow) });
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch promotions" }, { status: 500 });
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
    const desig = await prisma.designation.findUnique({ where: { id: parsed.data.designationId } });
    if (!desig) return NextResponse.json({ success: false, message: "Designation not found" }, { status: 400 });
    const item = await prisma.hrmPromotion.create({
      data: {
        employeeId: parsed.data.employeeId,
        designationId: parsed.data.designationId,
        title: parsed.data.title,
        promotionDate: new Date(parsed.data.promotionDate),
        description: parsed.data.description?.trim() || null,
      },
      include: { employee: { select: { name: true } }, designation: { select: { name: true } } },
    });
    return NextResponse.json({ success: true, message: "Promotion created", data: toRow(item) });
  } catch (error) {
    console.error("Error creating promotion:", error);
    return NextResponse.json({ success: false, message: "Failed to create promotion" }, { status: 500 });
  }
}
