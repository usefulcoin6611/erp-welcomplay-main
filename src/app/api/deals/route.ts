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

    const userBranches = await (prisma as any).branch.findMany({
      where: { ownerId: companyId },
      select: { id: true }
    })
    const branchIds = userBranches.map((b: any) => b.id)

    const deals = await (prisma.deal as any).findMany({
      include: {
        pipeline: true,
        stage: true,
      },
      orderBy: { createdAt: "desc" },
    }) as any[];

    const filteredDeals = deals.filter((d: any) => branchIds.includes(d.branchId));

    const data = filteredDeals.map((d: any) => {
      const labels = (d.labels as any) ?? [];
      const users = (d.users as any) ?? [];

      return {
        id: d.dealId,
        name: d.name,
        client: d.client ?? "",
        phone: d.phone ?? "",
        pipeline: d.pipeline?.name ?? "",
        pipelineId: d.pipelineId ?? "",
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

    const { name, client, price, phone, pipelineId } = validation.data;

    const numericPrice =
      typeof price === "string" ? parseFloat(price || "0") : price ?? 0;

    let pipeline;

    if (pipelineId) {
      pipeline = await prisma.pipeline.findUnique({
        where: { id: pipelineId },
      });
    }

    const { id: userId, ownerId } = session.user as any;
    const role = (session.user as any).role;
    const companyId = role === "company" ? userId : ownerId;

    if (!pipeline) {
      const pipelineName = "Default Pipeline";
      pipeline = await prisma.pipeline.findFirst({
        where: {
          name: pipelineName,
          branch: { ownerId: companyId },
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
    }

    const stage = await prisma.leadStage.findFirst({
      where: {
        pipelineId: pipeline.id,
      },
      orderBy: {
        order: "asc",
      },
    });

    const newDeal = await prisma.deal.create({
      data: {
        dealId: `DEAL-${Date.now()}`,
        name,
        client,
        phone,
        price: numericPrice,
        branchId,
        pipelineId: pipeline.id,
        stageId: stage?.id,
      },
      include: {
        pipeline: true,
        stage: true,
      },
    });

    const labels = (newDeal.labels as any) ?? [];
    const users = (newDeal.users as any) ?? [];

    const responseData = {
      id: newDeal.dealId,
      name: newDeal.name,
      client: newDeal.client ?? "",
      phone: newDeal.phone ?? "",
      pipeline: newDeal.pipeline?.name ?? "",
      pipelineId: newDeal.pipelineId ?? "",
      stage: newDeal.stage?.name ?? "",
      price: newDeal.price ?? 0,
      status: newDeal.status ?? "",
      createdAt: newDeal.createdAt.toISOString(),
      tasks: {
        total: newDeal.tasksTotal ?? 0,
        completed: newDeal.tasksCompleted ?? 0,
      },
      productsCount: newDeal.productsCount ?? 0,
      sourcesCount: newDeal.sourcesCount ?? 0,
      labels: Array.isArray(labels) ? labels : [],
      users: Array.isArray(users) ? users : [],
    };

    return NextResponse.json({
      success: true,
      message: "Deal berhasil dibuat",
      data: responseData,
    });
  } catch (error) {
    console.error("Error creating deal:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat deal" },
      { status: 500 }
    );
  }
}
