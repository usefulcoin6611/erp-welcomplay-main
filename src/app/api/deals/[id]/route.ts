import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const dealSchema = z.object({
  name: z.string().min(1, "Nama deal wajib diisi"),
  client: z.string().optional().nullable(),
  price: z.union([z.number(), z.string()]).optional(),
  phone: z.string().optional().nullable(),
  pipelineId: z.string().optional().nullable(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: dealId } = await params;
    const rawBody = await request.json();
    const validation = dealSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0].message,
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, client, price, phone, pipelineId } = validation.data;
    const numericPrice =
      typeof price === "string" ? parseFloat(price || "0") : price ?? 0;

    const existing = await prisma.deal.findUnique({
      where: { dealId },
      include: { pipeline: true, stage: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Deal tidak ditemukan" },
        { status: 404 }
      );
    }

    const updateData: {
      name: string;
      client: string | null;
      phone: string | null;
      price: number;
      pipelineId?: string;
      stageId?: string | null;
    } = {
      name,
      client: client ?? null,
      phone: phone ?? null,
      price: numericPrice,
    };

    if (pipelineId) {
      const pipeline = await prisma.pipeline.findUnique({
        where: { id: pipelineId },
      });
      if (pipeline) {
        updateData.pipelineId = pipeline.id;
        const stage = await prisma.leadStage.findFirst({
          where: { pipelineId: pipeline.id },
          orderBy: { order: "asc" },
        });
        updateData.stageId = stage?.id ?? null;
      }
    }

    const updated = await prisma.deal.update({
      where: { dealId },
      data: updateData,
      include: { pipeline: true, stage: true },
    });

    const labels = (updated.labels as any) ?? [];
    const users = (updated.users as any) ?? [];

    const responseData = {
      id: updated.dealId,
      name: updated.name,
      client: updated.client ?? "",
      phone: updated.phone ?? "",
      pipeline: updated.pipeline?.name ?? "",
      pipelineId: updated.pipelineId ?? "",
      stage: updated.stage?.name ?? "",
      price: updated.price ?? 0,
      status: updated.status ?? "",
      createdAt: updated.createdAt.toISOString(),
      tasks: {
        total: updated.tasksTotal ?? 0,
        completed: updated.tasksCompleted ?? 0,
      },
      productsCount: updated.productsCount ?? 0,
      sourcesCount: updated.sourcesCount ?? 0,
      labels: Array.isArray(labels) ? labels : [],
      users: Array.isArray(users) ? users : [],
    };

    return NextResponse.json({
      success: true,
      message: "Deal berhasil diubah",
      data: responseData,
    });
  } catch (error) {
    console.error("Error updating deal:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengubah deal" },
      { status: 500 }
    );
  }
}
