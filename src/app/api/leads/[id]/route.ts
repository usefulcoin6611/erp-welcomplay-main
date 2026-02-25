import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const leadUpdateSchema = z.object({
  name: z.string().min(1, "Nama lead wajib diisi"),
  subject: z.string().optional().nullable(),
  email: z.string().email("Email tidak valid").optional().nullable(),
  phone: z.string().optional().nullable(),
  pipelineId: z.string().optional().nullable(),
  stageId: z.string().optional().nullable(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;
    const { id } = params;
    const rawBody = await request.json();
    const validation = leadUpdateSchema.safeParse(rawBody);

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

    const { name, subject, email, phone, pipelineId, stageId } = validation.data;

    // Verify lead exists
    const existingLead = await prisma.lead.findUnique({
      where: { leadId: id },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, message: "Lead tidak ditemukan" },
        { status: 404 }
      );
    }

    const updatedLead = await prisma.lead.update({
      where: { leadId: id },
      data: {
        name,
        subject,
        email,
        phone,
        pipelineId: pipelineId || existingLead.pipelineId,
        stageId: stageId || existingLead.stageId,
      },
      include: {
        pipeline: true,
        stage: true,
        owner: true,
      },
    });

    const data = {
      id: updatedLead.leadId,
      name: updatedLead.name,
      subject: updatedLead.subject ?? "",
      email: updatedLead.email ?? "",
      phone: updatedLead.phone ?? "",
      pipeline: updatedLead.pipeline?.name ?? "",
      stage: updatedLead.stage?.name ?? "",
      owner: updatedLead.owner?.name ?? "",
      createdAt: (updatedLead.date ?? updatedLead.createdAt).toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Lead berhasil diperbarui",
      data,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui lead" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await props.params;
    const { id } = params;

    const existingLead = await prisma.lead.findUnique({
      where: { leadId: id },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, message: "Lead tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.lead.delete({
      where: { leadId: id },
    });

    return NextResponse.json({
      success: true,
      message: "Lead berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus lead" },
      { status: 500 }
    );
  }
}
