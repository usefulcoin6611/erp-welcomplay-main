import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const customFieldSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  type: z.string().min(1, "Type wajib diisi"),
  module: z.string().min(1, "Module wajib diisi"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fields = await prisma.customField.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: fields });
  } catch (error) {
    console.error("Error fetching custom fields:", error);
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

    const userRole = (session.user as any).role;
    if (userRole !== "super admin" && userRole !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = customFieldSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: validation.error.errors[0].message,
          errors: validation.error.format() 
        },
        { status: 400 }
      );
    }

    const { name, type, module } = validation.data;

    const field = await prisma.customField.create({
      data: { name, type, module },
    });

    return NextResponse.json({ success: true, data: field });
  } catch (error) {
    console.error("Error creating custom field:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat custom field" },
      { status: 500 }
    );
  }
}
