import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const coaSchema = z.object({
  name: z.string().min(1, "Nama akun wajib diisi"),
  code: z.string().min(1, "Kode akun wajib diisi"),
  type: z.enum(["Assets", "Liabilities", "Equity", "Income", "Costs of Goods Sold", "Expenses"]),
  subType: z.string().min(1, "Sub tipe wajib diisi"),
  description: z.string().optional().nullable(),
  isSubAccount: z.boolean().default(false),
  parentId: z.string().optional().nullable(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

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

    const userRole = (session.user as any).role;
    if (userRole !== "super admin" && userRole !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = coaSchema.safeParse(body);

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

    const { name, code, type, subType, description, isSubAccount, parentId, status } = validation.data;

    const actualParentId = parentId === "none" ? null : parentId;

    // Check if code already exists and not the current one
    const existingCode = await prisma.chartOfAccount.findFirst({
      where: { 
        code,
        NOT: { id }
      },
    });

    if (existingCode) {
      return NextResponse.json(
        { success: false, message: "Kode akun sudah digunakan" },
        { status: 400 }
      );
    }

    const coa = await prisma.chartOfAccount.update({
      where: { id },
      data: {
        name,
        code,
        type,
        subType,
        description,
        isSubAccount: !!actualParentId,
        parentId: actualParentId,
        status,
      },
    });

    return NextResponse.json({ success: true, data: coa });
  } catch (error) {
    console.error("Error updating COA:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui Chart of Account" },
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

    const userRole = (session.user as any).role;
    if (userRole !== "super admin" && userRole !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 }
      );
    }

    // Check if account has sub-accounts
    const subAccounts = await prisma.chartOfAccount.findFirst({
      where: { parentId: id }
    });

    if (subAccounts) {
      return NextResponse.json(
        { success: false, message: "Tidak dapat menghapus akun yang memiliki sub-akun" },
        { status: 400 }
      );
    }

    await prisma.chartOfAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Chart of Account berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting COA:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus Chart of Account" },
      { status: 500 }
    );
  }
}
