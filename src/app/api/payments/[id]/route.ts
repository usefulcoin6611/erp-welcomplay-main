import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const paymentUpdateSchema = z.object({
  date: z.string().min(1).optional(),
  vendor: z.string().min(1).optional(),
  account: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  amount: z.number().nonnegative().optional(),
  status: z.string().optional(),
  reference: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

const db = prisma as any;

export async function GET(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = (session.user as any).branchId as string | null;

    if (!branchId) {
      return NextResponse.json(
        { error: "User has no assigned branch" },
        { status: 400 },
      );
    }

    const payment = await db.payment.findFirst({
      where: {
        id: id,
        branchId,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    console.error("Error fetching payment detail:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = (session.user as any).branchId as string | null;

    if (!branchId) {
      return NextResponse.json(
        { error: "User has no assigned branch" },
        { status: 400 },
      );
    }

    // Handle FormData
    const formData = await request.formData();
    const rawData: any = {};
    if (formData.has("date")) rawData.date = formData.get("date");
    if (formData.has("vendor")) rawData.vendor = formData.get("vendor");
    if (formData.has("account")) rawData.account = formData.get("account");
    if (formData.has("category")) rawData.category = formData.get("category");
    if (formData.has("amount")) rawData.amount = Number(formData.get("amount"));
    if (formData.has("status")) rawData.status = formData.get("status");
    if (formData.has("reference")) rawData.reference = formData.get("reference") || null;
    if (formData.has("description")) rawData.description = formData.get("description") || null;

    const validation = paymentUpdateSchema.safeParse(rawData);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0].message,
          errors: validation.error.format(),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    const existing = await db.payment.findFirst({
      where: {
        id: id,
        branchId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Payment tidak ditemukan" },
        { status: 404 },
      );
    }

    // Handle File Upload
    let paymentReceipt = undefined;
    const file = formData.get("paymentReceipt") as File | null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}_${file.name.replace(/\s/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/payments");
      
      try {
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, filename), buffer);
        paymentReceipt = `/uploads/payments/${filename}`;
      } catch (err) {
        console.error("Error saving file:", err);
      }
    }

    const updated = await db.payment.update({
      where: { id: existing.id },
      data: {
        date: data.date ? new Date(data.date) : existing.date,
        vendor: data.vendor ?? existing.vendor,
        account: data.account ?? existing.account,
        category: data.category ?? existing.category,
        amount:
          typeof data.amount === "number" ? data.amount : existing.amount,
        status: data.status ?? existing.status,
        reference:
          data.reference === undefined
            ? existing.reference
            : data.reference ?? null,
        description:
          data.description === undefined
            ? existing.description
            : data.description ?? null,
        paymentReceipt: paymentReceipt !== undefined ? paymentReceipt : existing.paymentReceipt,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupdate Payment" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
) {
  try {
    const { id } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branchId = (session.user as any).branchId as string | null;

    if (!branchId) {
      return NextResponse.json(
        { error: "User has no assigned branch" },
        { status: 400 },
      );
    }

    const existing = await db.payment.findFirst({
      where: {
        id: id,
        branchId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Payment tidak ditemukan" },
        { status: 404 },
      );
    }

    await db.payment.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting payment:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus Payment" },
      { status: 500 },
    );
  }
}
