import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const dealSchema = z.object({
  name: z.string().min(1, "Nama deal wajib diisi"),
  client: z.string().optional().nullable(),
  price: z.union([z.number(), z.string()]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deals = await prisma.deal.findMany({
      include: {
        pipeline: true,
        stage: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const data = deals.map((d: (typeof deals)[number]) => {
      const labels = (d.labels as any) ?? [];
      const users = (d.users as any) ?? [];

      return {
        id: d.dealId,
        name: d.name,
        client: d.client ?? "",
        pipeline: d.pipeline?.name ?? "",
        stage: d.stage?.name ?? "",
        price: d.price ?? 0,
        status: d.status ?? "",
        createdAt: d.createdAt.toISOString(),
        tasks: {
          total: d.tasksTotal ?? 0,
          completed: d.tasksCompleted ?? 0,
        },
        productsCount: d.productsCount ?? 0,
        sourcesCount: d.sourcesCount ?? 0,
        labels: Array.isArray(labels) ? labels : [],
        users: Array.isArray(users) ? users : [],
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
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

    const branchId = ((session.user as any).branchId as string | null) || null;

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

    const { name, client, price } = validation.data;

    const numericPrice =
      typeof price === "string" ? parseFloat(price || "0") : price ?? 0;

    const pipelineName = "Default Pipeline";

    let pipeline = await prisma.pipeline.findFirst({
      where: {
        name: pipelineName,
        branchId,
      },
    });

    if (!pipeline) {
      pipeline = await prisma.pipeline.create({
        data: {
          name: pipelineName,
          branchId,
        },
      });
    }

    let stage = await prisma.leadStage.findFirst({
      where: {
        name: "Proposal Sent",
        pipelineId: pipeline.id,
      },
    });

    if (!stage) {
      stage = await prisma.leadStage.create({
        data: {
          name: "Proposal Sent",
          order: 0,
          pipelineId: pipeline.id,
        },
      });
    }

    const lastDeal = await prisma.deal.findFirst({
      where: branchId ? { branchId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 1;
    if (lastDeal?.dealId) {
      const match = lastDeal.dealId.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const dealId = `DEAL-${String(nextNumber).padStart(3, "0")}`;

    const created = await prisma.deal.create({
      data: {
        dealId,
        branchId,
        name,
        client: client ?? null,
        price: numericPrice,
        pipelineId: pipeline.id,
        stageId: stage.id,
        status: "Open",
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: created.dealId,
          name: created.name,
          client: created.client ?? "",
          pipeline: pipeline.name,
          stage: stage.name,
          price: created.price ?? 0,
          status: created.status ?? "",
          createdAt: created.createdAt.toISOString(),
          tasks: {
            total: created.tasksTotal ?? 0,
            completed: created.tasksCompleted ?? 0,
          },
          productsCount: created.productsCount ?? 0,
          sourcesCount: created.sourcesCount ?? 0,
          labels: [],
          users: [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

