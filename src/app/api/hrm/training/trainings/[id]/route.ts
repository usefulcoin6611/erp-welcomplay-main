import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";
import {
  TRAINING_STATUS_OPTIONS,
  TRAINING_PERFORMANCE_OPTIONS,
} from "@/lib/training-data";

const statusEnum = z.enum(TRAINING_STATUS_OPTIONS);
const performanceEnum = z.enum(TRAINING_PERFORMANCE_OPTIONS);

const updateTrainingSchema = z.object({
  branch: z.string().trim().min(1).optional(),
  trainerOption: z.enum(["Internal", "External"]).optional(),
  trainingTypeId: z.string().trim().min(1).optional(),
  employeeId: z.string().trim().min(1).optional(),
  trainerId: z.string().trim().min(1).optional(),
  status: statusEnum.optional(),
  startDate: z.string().trim().min(1).optional(),
  endDate: z.string().trim().min(1).optional(),
  cost: z.coerce.number().min(0).optional(),
  description: z.string().trim().optional().nullable(),
  performance: performanceEnum.optional(),
  remarks: z.string().trim().optional().nullable(),
});

function toResponse(t: any) {
  return {
    id: t.id,
    branch: t.branch,
    trainingType: t.trainingType?.name ?? "",
    status: t.status,
    employee: t.employee?.name ?? "",
    trainer: `${t.trainer?.firstName ?? ""} ${t.trainer?.lastName ?? ""}`.trim(),
    startDate: t.startDate.toISOString().split("T")[0],
    endDate: t.endDate.toISOString().split("T")[0],
    cost: t.cost,
    description: t.description ?? undefined,
    createdAt: t.createdAt.toISOString().split("T")[0],
    trainingTypeId: t.trainingTypeId,
    employeeId: t.employeeId,
    trainerId: t.trainerId,
    performance: t.performance ?? undefined,
    remarks: t.remarks ?? undefined,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const item = await prisma.training.findUnique({
      where: { id },
      include: {
        trainingType: { select: { name: true } },
        employee: { select: { id: true, name: true } },
        trainer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Training tidak ditemukan" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: toResponse(item) });
  } catch (error) {
    console.error("Error fetching training:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat training" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "super admin" && role !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;
    const existing = await prisma.training.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Training tidak ditemukan" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = updateTrainingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.errors[0]?.message ?? "Data tidak valid",
          errors: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const data: Record<string, unknown> = { ...parsed.data };

    let start = existing.startDate;
    let end = existing.endDate;
    if (parsed.data.startDate != null) {
      start = new Date(parsed.data.startDate + "T00:00:00.000Z");
      (data as any).startDate = start;
    }
    if (parsed.data.endDate != null) {
      end = new Date(parsed.data.endDate + "T00:00:00.000Z");
      (data as any).endDate = end;
    }
    if (end < start) {
      return NextResponse.json(
        {
          success: false,
          message: "End date tidak boleh lebih kecil dari start date",
        },
        { status: 400 },
      );
    }

    const updated = await prisma.training.update({
      where: { id },
      data,
      include: {
        trainingType: { select: { name: true } },
        employee: { select: { id: true, name: true } },
        trainer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Training berhasil diperbarui",
      data: toResponse(updated),
    });
  } catch (error) {
    console.error("Error updating training:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui training" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "super admin" && role !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;
    await prisma.training.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Training berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting training:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus training" },
      { status: 500 },
    );
  }
}

