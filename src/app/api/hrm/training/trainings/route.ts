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

const createTrainingSchema = z.object({
  branch: z.string().trim().min(1, "Branch wajib diisi"),
  trainerOption: z
    .enum(["Internal", "External"], {
      invalid_type_error: "Trainer option tidak valid",
    })
    .default("Internal"),
  trainingTypeId: z.string().trim().min(1, "Training type wajib diisi"),
  employeeId: z.string().trim().min(1, "Employee wajib diisi"),
  trainerId: z.string().trim().min(1, "Trainer wajib diisi"),
  status: statusEnum.default("Pending"),
  startDate: z.string().trim().min(1, "Start date wajib diisi"),
  endDate: z.string().trim().min(1, "End date wajib diisi"),
  cost: z.coerce.number().min(0, "Cost tidak boleh negatif"),
  description: z.string().trim().optional().nullable(),
  performance: performanceEnum.optional(),
  remarks: z.string().trim().optional().nullable(),
});

const updateTrainingSchema = createTrainingSchema.partial();

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
    // IDs needed for edit modal selects
    trainingTypeId: t.trainingTypeId,
    employeeId: t.employeeId,
    trainerId: t.trainerId,
  };
}

export async function GET(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const where: any = {
      employee: {
        ownerId: companyId,
      },
    };

    const list = await prisma.training.findMany({
      where,
      orderBy: { startDate: "desc" },
      include: {
        trainingType: { select: { name: true } },
        employee: { select: { id: true, name: true } },
        trainer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: list.map(toResponse),
    });
  } catch (error) {
    console.error("Error fetching trainings:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat training" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const parsed = createTrainingSchema.safeParse(body);
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

    const data = parsed.data;
    const start = new Date(`${data.startDate}T00:00:00.000Z`);
    const end = new Date(`${data.endDate}T00:00:00.000Z`);
    if (end < start) {
      return NextResponse.json(
        {
          success: false,
          message: "End date tidak boleh lebih kecil dari start date",
        },
        { status: 400 },
      );
    }

    // Pastikan relasi exist untuk memberikan error yang lebih ramah
    const [type, employee, trainer] = await Promise.all([
      prisma.trainingType.findUnique({ where: { id: data.trainingTypeId } }),
      prisma.employee.findUnique({ where: { id: data.employeeId } }),
      prisma.trainer.findUnique({ where: { id: data.trainerId } }),
    ]);
    if (!type) {
      return NextResponse.json(
        { success: false, message: "Training type tidak ditemukan" },
        { status: 400 },
      );
    }
    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee tidak ditemukan" },
        { status: 400 },
      );
    }
    if (!trainer) {
      return NextResponse.json(
        { success: false, message: "Trainer tidak ditemukan" },
        { status: 400 },
      );
    }

    const created = await prisma.training.create({
      data: {
        branch: data.branch,
        trainerOption: data.trainerOption,
        trainingTypeId: data.trainingTypeId,
        employeeId: data.employeeId,
        trainerId: data.trainerId,
        status: data.status,
        startDate: start,
        endDate: end,
        cost: data.cost,
        description: data.description ?? null,
        performance: data.performance ?? null,
        remarks: data.remarks ?? null,
      },
      include: {
        trainingType: { select: { name: true } },
        employee: { select: { id: true, name: true } },
        trainer: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Training berhasil dibuat",
      data: toResponse(created),
    });
  } catch (error) {
    console.error("Error creating training:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat training" },
      { status: 500 },
    );
  }
}

