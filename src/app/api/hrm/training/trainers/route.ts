import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createTrainerSchema = z.object({
  branch: z.string().trim().min(1, "Branch wajib diisi"),
  firstName: z.string().trim().min(1, "First name wajib diisi"),
  lastName: z.string().trim().min(1, "Last name wajib diisi"),
  contact: z.string().trim().min(1, "Contact wajib diisi"),
  email: z.string().trim().email("Email tidak valid"),
  expertise: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
});

const updateTrainerSchema = createTrainerSchema.partial();

export async function GET(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { role?: string; branchId?: string };
    const where: Record<string, unknown> = {};

    if (user.role !== "super admin" && user.role !== "company" && user.branchId) {
      const userBranch = await prisma.branch.findUnique({ where: { id: user.branchId } });
      if (userBranch) {
        where.branch = userBranch.name;
      }
    }

    const list = await prisma.trainer.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("Error fetching trainers:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat trainer" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "super admin" && role !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = createTrainerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.errors[0]?.message ?? "Data tidak valid",
          errors: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const created = await prisma.trainer.create({
      data: {
        branch: data.branch,
        firstName: data.firstName,
        lastName: data.lastName,
        contact: data.contact,
        email: data.email,
        expertise: data.expertise ?? null,
        address: data.address ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Trainer berhasil dibuat",
      data: created,
    });
  } catch (error: any) {
    console.error("Error creating trainer:", error);
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Email trainer sudah digunakan" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, message: "Gagal membuat trainer" },
      { status: 500 },
    );
  }
}

