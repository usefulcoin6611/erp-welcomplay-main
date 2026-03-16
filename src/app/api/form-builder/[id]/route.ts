import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateFormSchema = z.object({
  name: z.string().min(1, "Nama form wajib diisi").optional(),
  code: z.string().min(1, "Kode form wajib diisi").optional(),
  isActive: z.boolean().optional(),
  isLeadActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = (session.user as any).branchId as string | null;

    const form = await prisma.formBuilder.findFirst({
      where: { 
        formId: id,
        branchId: branchId || null,
      },
      include: {
        fields: true,
      },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, message: "Form tidak ditemukan" },
        { status: 404 }
      );
    }

    const data = {
      id: form.formId,
      name: form.name,
      code: form.code,
      isActive: form.isActive,
      isLeadActive: form.isLeadActive,
      responses: form.responses,
      fields: form.fields.map((field: any) => ({
        id: field.id,
        name: field.name,
        type: field.type,
        required: field.required,
      })),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = (session.user as any).branchId as string | null;

    const form = await prisma.formBuilder.findFirst({
      where: { 
        formId: id,
        branchId: branchId || null,
      },
      include: { fields: true },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, message: "Form tidak ditemukan" },
        { status: 404 }
      );
    }

    const rawBody = await request.json();
    const validation = updateFormSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0]?.message ?? "Data tidak valid",
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const data: { name?: string; code?: string; isActive?: boolean; isLeadActive?: boolean } = {};
    if (validation.data.name != null) data.name = validation.data.name;
    if (validation.data.code != null) data.code = validation.data.code;
    if (validation.data.isActive !== undefined) data.isActive = validation.data.isActive;
    if (validation.data.isLeadActive !== undefined) data.isLeadActive = validation.data.isLeadActive;

    const updated = await prisma.formBuilder.update({
      where: { id: form.id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Form berhasil diperbarui",
      data: {
        id: updated.formId,
        name: updated.name,
        code: updated.code,
        isActive: updated.isActive,
        isLeadActive: updated.isLeadActive,
        responses: updated.responses,
      },
    });
  } catch (error: any) {
    if (error && typeof error === "object" && (error as any).code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Kode form sudah digunakan" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = (session.user as any).branchId as string | null;

    const form = await prisma.formBuilder.findFirst({
      where: { 
        formId: id,
        branchId: branchId || null,
      },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, message: "Form tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.formBuilder.delete({
      where: { id: form.id },
    });

    return NextResponse.json({
      success: true,
      message: "Form berhasil dihapus",
    });
  } catch (error) {
    console.error("Form builder DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

