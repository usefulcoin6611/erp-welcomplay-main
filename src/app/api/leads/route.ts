import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(1, "Nama lead wajib diisi"),
  subject: z.string().optional().nullable(),
  email: z.string().email("Email tidak valid").optional().nullable(),
  phone: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      include: {
        pipeline: true,
        stage: true,
        owner: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const data = leads.map((l: (typeof leads)[number]) => ({
      id: l.leadId,
      name: l.name,
      subject: l.subject ?? "",
      email: l.email ?? "",
      phone: l.phone ?? "",
      pipeline: l.pipeline?.name ?? "",
      pipelineId: l.pipelineId ?? "",
      stage: l.stage?.name ?? "",
      owner: l.owner?.name ?? "",
      createdAt: (l.date ?? l.createdAt).toISOString(),
    }));

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

    const userId = (session.user as any).id as string | undefined;
    const branchId = ((session.user as any).branchId as string | null) || null;

    const rawBody = await request.json();
    const validation = leadSchema.safeParse(rawBody);

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

    const { name, subject, email, phone } = validation.data;

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
        name: "New",
        pipelineId: pipeline.id,
      },
    });

    if (!stage) {
      stage = await prisma.leadStage.create({
        data: {
          name: "New",
          order: 0,
          pipelineId: pipeline.id,
        },
      });
    }

    const lastLead = await prisma.lead.findFirst({
      where: branchId ? { branchId } : undefined,
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 1;
    if (lastLead?.leadId) {
      const match = lastLead.leadId.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const leadId = `LEAD-${String(nextNumber).padStart(3, "0")}`;

    const created = await prisma.lead.create({
      data: {
        leadId,
        branchId,
        name,
        subject: subject ?? null,
        email: email ?? null,
        phone: phone ?? null,
        pipelineId: pipeline.id,
        stageId: stage.id,
        ownerId: userId ?? null,
        createdById: userId ?? null,
        isActive: true,
        date: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: created.leadId,
          name: created.name,
          subject: created.subject ?? "",
          email: created.email ?? "",
          phone: created.phone ?? "",
          pipeline: pipeline.name,
          stage: stage.name,
          owner: (session.user as any).name ?? "",
          createdAt: (created.date ?? created.createdAt).toISOString(),
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
