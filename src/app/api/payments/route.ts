import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const paymentSchema = z.object({
  date: z.string().min(1, "Tanggal wajib diisi"),
  vendor: z.string().min(1, "Vendor wajib diisi"),
  account: z.string().min(1, "Akun wajib diisi"),
  category: z.string().min(1, "Kategori wajib diisi"),
  amount: z.number().nonnegative(),
  status: z.string().optional().default("Completed"),
  reference: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const db = prisma as any;

export async function GET(request: NextRequest) {
  try {
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

    const payments = await db.payment.findMany({
      where: {
        branchId,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}

async function generatePaymentId(branchId: string, date: Date) {
  const year = date.getFullYear();

  const lastPayment = await db.payment.findFirst({
    where: {
      branchId,
      paymentId: {
        startsWith: `PAY-${year}-`,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let nextNumber = 1;

  if (lastPayment?.paymentId) {
    const match = lastPayment.paymentId.match(/PAY-\d{4}-(\d{3,})$/);
    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  const sequence = String(nextNumber).padStart(3, "0");
  return `PAY-${year}-${sequence}`;
}

export async function POST(request: NextRequest) {
  try {
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

    // Handle FormData for file upload
    const formData = await request.formData();
    
    const rawData = {
      date: formData.get("date") as string,
      vendor: formData.get("vendor") as string,
      account: formData.get("account") as string,
      category: formData.get("category") as string,
      amount: Number(formData.get("amount")),
      status: formData.get("status") as string || "Completed",
      reference: formData.get("reference") as string || null,
      description: formData.get("description") as string || null,
    };

    const validation = paymentSchema.safeParse(rawData);

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
    const date = new Date(data.date);

    // Handle File Upload
    let paymentReceipt = null;
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
        // Continue without file if upload fails, or throw error
      }
    }

    const paymentId = await generatePaymentId(branchId, date);

    const payment = await db.payment.create({
      data: {
        paymentId,
        date,
        vendor: data.vendor,
        account: data.account,
        category: data.category,
        amount: data.amount,
        status: data.status ?? "Completed",
        reference: data.reference ?? undefined,
        description: data.description ?? undefined,
        paymentReceipt,
        branchId,
      },
    });

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat Payment" },
      { status: 500 },
    );
  }
}
