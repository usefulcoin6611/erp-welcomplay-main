import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateFieldSchema = z.object({
  name: z.string().min(1, "Nama field wajib diisi"),
  type: z.enum(["text", "number", "email", "date", "select", "textarea", "checkbox", "radio"]),
  required: z.boolean().default(false),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const { id, fieldId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const result = updateFieldSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, type, required } = result.data;

    // Verify form exists
    const form = await prisma.formBuilder.findUnique({
      where: { formId: id },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, message: "Form tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify field exists and belongs to form
    const field = await prisma.formField.findUnique({
      where: { id: fieldId },
    });

    if (!field || field.formId !== form.id) {
      return NextResponse.json(
        { success: false, message: "Field tidak ditemukan atau tidak milik form ini" },
        { status: 404 }
      );
    }

    const updated = await prisma.formField.update({
      where: { id: fieldId },
      data: {
        name,
        type,
        required,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Field berhasil diperbarui",
      data: {
        id: updated.id,
        name: updated.name,
        type: updated.type,
        required: updated.required,
      },
    });
  } catch (error) {
    console.error("Error updating field:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const { id, fieldId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify form exists
    const form = await prisma.formBuilder.findUnique({
      where: { formId: id },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, message: "Form tidak ditemukan" },
        { status: 404 }
      );
    }

    // Verify field exists and belongs to form
    const field = await prisma.formField.findUnique({
      where: { id: fieldId },
    });

    if (!field || field.formId !== form.id) {
      return NextResponse.json(
        { success: false, message: "Field tidak ditemukan atau tidak milik form ini" },
        { status: 404 }
      );
    }

    await prisma.formField.delete({
      where: { id: fieldId },
    });

    return NextResponse.json({
      success: true,
      message: "Field berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting field:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
