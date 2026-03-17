import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  awardTypeId: z.string().min(1, "Award type is required"),
  date: z.string().min(1, "Date is required"),
  gift: z.string().min(1, "Gift is required"),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const awards = await prisma.hrmAward.findMany({
      where: {
        employee: {
          ownerId: companyId,
        },
      },
      include: {
        employee: { select: { id: true, name: true } },
        awardType: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
    });

    const data = awards.map((a: any) => ({
      id: a.id,
      employeeId: a.employeeId,
      employeeName: a.employee.name,
      awardTypeId: a.awardTypeId,
      awardType: a.awardType.name,
      date: a.date.toISOString().split("T")[0],
      gift: a.gift,
      description: a.description ?? "",
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching awards:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch awards" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Invalid input";
      return NextResponse.json({ success: false, message: msg }, { status: 400 });
    }

    const { employeeId, awardTypeId, date, gift, description } = parsed.data;

    const [employee, awardType] = await Promise.all([
      prisma.employee.findUnique({ where: { id: employeeId } }),
      prisma.awardType.findUnique({ where: { id: awardTypeId } }),
    ]);

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 400 }
      );
    }
    if (!awardType) {
      return NextResponse.json(
        { success: false, message: "Award type not found" },
        { status: 400 }
      );
    }

    const award = await prisma.hrmAward.create({
      data: {
        employeeId,
        awardTypeId,
        date: new Date(date),
        gift,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Award created successfully",
      data: {
        id: award.id,
        employeeId,
        employeeName: employee.name,
        awardTypeId,
        awardType: awardType.name,
        date: award.date.toISOString().split("T")[0],
        gift: award.gift,
        description: award.description ?? "",
      },
    });
  } catch (error) {
    console.error("Error creating award:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create award" },
      { status: 500 }
    );
  }
}
