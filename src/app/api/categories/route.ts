import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  type: z.enum([
    "Income",
    "Expense",
    "Product & Service",
    "Asset",
    "Liability",
    "Equity",
    "Costs of Goods Sold",
  ]),
  account: z.string().optional().nullable(),
  color: z
    .string()
    .min(1, "Warna kategori wajib diisi")
    .regex(/^[0-9a-fA-F]{3,8}$/, "Warna harus berupa kode hex tanpa #")
    .optional()
    .nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = (session.user as any).branchId as string | null;

    const where: any = {};
    if (branchId) {
      where.branchId = branchId;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
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
    const validation = categorySchema.safeParse(body);

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

    const { name, type, account, color } = validation.data;
    const branchId = (session.user as any).branchId as string | null;

    const category = await prisma.category.create({
      data: {
        name,
        type,
        account: account || null,
        color: (color || "FFFFFF").toUpperCase(),
        branchId,
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat category" },
      { status: 500 }
    );
  }
}
