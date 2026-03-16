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
  ownerId: z.string().optional().nullable(),
  sources: z.string().optional().nullable(),
  products: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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

    const { name, subject, email, phone, pipelineId, stageId, ownerId, sources, products, notes } = validation.data;

    const branchId = (session.user as any).branchId as string | null;

    // Verify lead exists and belongs to branch
    const existingLead = await prisma.lead.findFirst({
      where: { 
        leadId: id,
        branchId: branchId || null,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, message: "Lead tidak ditemukan atau akses ditolak" },
        { status: 404 }
      );
    }

    const updatedLead = await prisma.lead.update({
      where: { leadId: id },
      data: {
        name,
        subject: subject ?? null,
        email: email ?? null,
        phone: phone ?? null,
        pipelineId: pipelineId || existingLead.pipelineId,
        stageId: stageId || existingLead.stageId,
        ownerId: ownerId !== undefined ? ownerId : existingLead.ownerId,
        sources: sources !== undefined ? sources : existingLead.sources,
        products: products !== undefined ? products : existingLead.products,
        notes: notes !== undefined ? notes : existingLead.notes,
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
      pipeline: (updatedLead as any).pipeline?.name ?? "",
      pipelineId: updatedLead.pipelineId ?? "",
      stage: (updatedLead as any).stage?.name ?? "",
      stageId: updatedLead.stageId ?? "",
      owner: (updatedLead as any).owner?.name ?? "",
      ownerId: updatedLead.ownerId ?? "",
      sources: updatedLead.sources ?? "",
      products: updatedLead.products ?? "",
      notes: updatedLead.notes ?? "",
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

    const branchId = (session.user as any).branchId as string | null;

    const existingLead = await prisma.lead.findFirst({
      where: { 
        leadId: id,
        branchId: branchId || null,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, message: "Lead tidak ditemukan atau akses ditolak" },
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
