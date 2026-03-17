import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const taxSchema = z.object({
  name: z.string().min(1, "Nama tax wajib diisi"),
  rate: z.coerce.number().min(0, "Rate harus lebih besar atau sama dengan 0"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const taxes = await prisma.tax.findMany({
      where: {
        branch: {
          ownerId: companyId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: taxes });
  } catch (error) {
    console.error("Error fetching taxes:", error);
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
    const validation = taxSchema.safeParse(body);

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

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const userBranches = await prisma.branch.findMany({
      where: { ownerId: companyId },
      select: { id: true }
    })
    const branchIds = userBranches.map((b: any) => b.id)
    const branchId = (session.user as any).branchId || branchIds[0];

    const { name, rate } = validation.data;

    const tax = await prisma.tax.create({
      data: {
        name,
        rate,
        branchId,
      },
    });

    return NextResponse.json({ success: true, data: tax });
  } catch (error) {
    console.error("Error creating tax:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat tax" },
      { status: 500 }
    );
  }
}
