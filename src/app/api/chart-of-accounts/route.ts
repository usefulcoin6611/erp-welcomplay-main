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

    const coas = await prisma.chartOfAccount.findMany({
      where: {
        branch: {
          ownerId: companyId,
        },
      },
      include: {
        subAccounts: true,
        parent: true,
      },
      orderBy: [
        { type: 'asc' },
        { code: 'asc' }
      ],
    });

    return NextResponse.json({ success: true, data: coas });
  } catch (error) {
    console.error("Error fetching COAs:", error);
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
    const branchId = (session.user as any).branchId;

    if (!branchId) {
      return NextResponse.json({ error: "User has no assigned branch" }, { status: 400 });
    }

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

    // Check if code already exists
    const existingCode = await prisma.chartOfAccount.findUnique({
      where: { code },
    });

    if (existingCode) {
      return NextResponse.json(
        { success: false, message: "Kode akun sudah digunakan" },
        { status: 400 }
      );
    }

    const coa = await prisma.chartOfAccount.create({
      data: {
        name,
        code,
        type,
        subType,
        description,
        isSubAccount,
        parentId: actualParentId,
        status,
        branchId, // Set the branchId from session
      },
    });

    return NextResponse.json({ success: true, data: coa });
  } catch (error) {
    console.error("Error creating COA:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat Chart of Account" },
      { status: 500 }
    );
  }
}
