import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

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

    const form = await prisma.formBuilder.findUnique({
      where: { formId: id },
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
      fields: form.fields.map((field) => ({
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

