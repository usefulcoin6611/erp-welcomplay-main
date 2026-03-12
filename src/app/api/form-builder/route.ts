import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Nama form wajib diisi"),
  code: z.string().min(1, "Kode form wajib diisi"),
  isActive: z.boolean().optional().default(true),
  isLeadActive: z.boolean().optional().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const forms = await prisma.formBuilder.findMany({
      orderBy: { createdAt: "desc" },
    });

    const data = forms.map((f) => ({
      id: f.formId,
      name: f.name,
      code: f.code,
      isActive: f.isActive,
      isLeadActive: f.isLeadActive,
      responses: f.responses,
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

    const rawBody = await request.json();
    const validation = formSchema.safeParse(rawBody);

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

    const { name, code, isActive, isLeadActive } = validation.data;

    const lastForm = await prisma.formBuilder.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 1;
    if (lastForm?.formId) {
      const match = lastForm.formId.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const formId = `FRM-${String(nextNumber).padStart(3, "0")}`;

    const created = await prisma.formBuilder.create({
      data: {
        formId,
        name,
        code,
        isActive: isActive ?? true,
        isLeadActive: isLeadActive ?? false,
        responses: 0,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: created.formId,
          name: created.name,
          code: created.code,
          isActive: created.isActive,
          isLeadActive: created.isLeadActive,
          responses: created.responses,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error && typeof error === "object" && (error as any).code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "Kode form sudah digunakan",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

