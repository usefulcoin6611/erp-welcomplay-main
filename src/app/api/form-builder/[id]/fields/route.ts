import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createFieldSchema = z.object({
  name: z.string().min(1, "Nama field wajib diisi"),
  type: z.enum(["text", "number", "email", "date", "select", "textarea", "checkbox", "radio"]),
  required: z.boolean().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // formId (FRM-xxx)

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const result = createFieldSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, type, required } = result.data;

    // Find the form first to get its UUID
    const form = await prisma.formBuilder.findUnique({
      where: { formId: id },
    });

    if (!form) {
      return NextResponse.json(
        { success: false, message: "Form tidak ditemukan" },
        { status: 404 }
      );
    }

    const field = await prisma.formField.create({
      data: {
        formId: form.id, // Use the UUID
        name,
        type,
        required,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Field berhasil dibuat",
      data: {
        id: field.id,
        name: field.name,
        type: field.type,
        required: field.required,
      },
    });
  } catch (error) {
    console.error("Error creating field:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
