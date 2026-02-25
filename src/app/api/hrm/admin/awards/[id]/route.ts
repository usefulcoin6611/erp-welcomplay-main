import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  employeeId: z.string().min(1).optional(),
  awardTypeId: z.string().min(1).optional(),
  date: z.string().min(1).optional(),
  gift: z.string().min(1).optional(),
  description: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const award = await prisma.hrmAward.findUnique({
      where: { id },
      include: {
        employee: { select: { id: true, name: true } },
        awardType: { select: { id: true, name: true } },
      },
    });

    if (!award) {
      return NextResponse.json(
        { success: false, message: "Award not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: award.id,
        employeeId: award.employeeId,
        employeeName: award.employee.name,
        awardTypeId: award.awardTypeId,
        awardType: award.awardType.name,
        date: award.date.toISOString().split("T")[0],
        gift: award.gift,
        description: award.description ?? "",
      },
    });
  } catch (error) {
    console.error("Error fetching award:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch award" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Invalid input";
      return NextResponse.json({ success: false, message: msg }, { status: 400 });
    }

    const existing = await prisma.hrmAward.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Award not found" },
        { status: 404 }
      );
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.employeeId) {
      const emp = await prisma.employee.findUnique({
        where: { id: parsed.data.employeeId },
      });
      if (!emp) {
        return NextResponse.json(
          { success: false, message: "Employee not found" },
          { status: 400 }
        );
      }
      data.employeeId = parsed.data.employeeId;
    }
    if (parsed.data.awardTypeId) {
      const at = await prisma.awardType.findUnique({
        where: { id: parsed.data.awardTypeId },
      });
      if (!at) {
        return NextResponse.json(
          { success: false, message: "Award type not found" },
          { status: 400 }
        );
      }
      data.awardTypeId = parsed.data.awardTypeId;
    }
    if (parsed.data.date) data.date = new Date(parsed.data.date);
    if (parsed.data.gift !== undefined) data.gift = parsed.data.gift;
    if (parsed.data.description !== undefined)
      data.description = parsed.data.description?.trim() || null;

    const award = await prisma.hrmAward.update({
      where: { id },
      data,
      include: {
        employee: { select: { name: true } },
        awardType: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Award updated successfully",
      data: {
        id: award.id,
        employeeId: award.employeeId,
        employeeName: award.employee.name,
        awardTypeId: award.awardTypeId,
        awardType: award.awardType.name,
        date: award.date.toISOString().split("T")[0],
        gift: award.gift,
        description: award.description ?? "",
      },
    });
  } catch (error) {
    console.error("Error updating award:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update award" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.hrmAward.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Award deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting award:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete award" },
      { status: 500 }
    );
  }
}
