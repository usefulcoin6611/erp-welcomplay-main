import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

async function ensureTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS hrm_assets (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      purchase_date DATE NULL,
      supported_date DATE NULL,
      amount NUMERIC(18,2) NOT NULL DEFAULT 0,
      description TEXT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS hrm_asset_employees (
      id SERIAL PRIMARY KEY,
      asset_id INTEGER NOT NULL REFERENCES hrm_assets(id) ON DELETE CASCADE,
      employee_id TEXT NOT NULL REFERENCES employee(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (asset_id, employee_id)
    );
  `);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
        { status: 403 },
      );
    }

    const { id } = await params;
    const numericId = Number(id);

    if (Number.isNaN(numericId)) {
      return NextResponse.json(
        { success: false, message: "ID asset tidak valid" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const name: string = String(body.name ?? "").trim();
    const employeeIds: string[] = Array.isArray(body.employeeIds)
      ? body.employeeIds.map((eid: unknown) => String(eid))
      : [];
    const purchaseDateStr: string = String(body.purchaseDate ?? "");
    const supportedDateStr: string = String(body.supportedDate ?? "");
    const amountNumber = Number(body.amount ?? 0);
    const description: string | null =
      body.description && String(body.description).trim().length > 0
        ? String(body.description).trim()
        : null;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama asset wajib diisi" },
        { status: 400 },
      );
    }

    if (!purchaseDateStr || !supportedDateStr) {
      return NextResponse.json(
        { success: false, message: "Purchase date dan supported date wajib diisi" },
        { status: 400 },
      );
    }

    const purchaseDate = new Date(`${purchaseDateStr}T00:00:00.000Z`);
    const supportedDate = new Date(`${supportedDateStr}T00:00:00.000Z`);

    if (Number.isNaN(purchaseDate.getTime()) || Number.isNaN(supportedDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Format tanggal tidak valid" },
        { status: 400 },
      );
    }

    if (supportedDate < purchaseDate) {
      return NextResponse.json(
        { success: false, message: "Supported date tidak boleh sebelum purchase date" },
        { status: 400 },
      );
    }

    if (Number.isNaN(amountNumber) || amountNumber < 0) {
      return NextResponse.json(
        { success: false, message: "Amount harus berupa angka positif" },
        { status: 400 },
      );
    }

    if (!employeeIds.length) {
      return NextResponse.json(
        { success: false, message: "Minimal satu employee harus dipilih" },
        { status: 400 },
      );
    }

    const employees = await prisma.employee.findMany({
      where: { id: { in: employeeIds } },
      select: { id: true },
    });

    if (!employees.length) {
      return NextResponse.json(
        { success: false, message: "Employee tidak ditemukan" },
        { status: 400 },
      );
    }

    if (employees.length !== employeeIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Beberapa employee yang dipilih tidak ditemukan",
        },
        { status: 400 },
      );
    }

    await ensureTables();

    const updated =
      await prisma.$queryRawUnsafe(
        `
          UPDATE hrm_assets
          SET
            name = $1,
            purchase_date = $2,
            supported_date = $3,
            amount = $4,
            description = $5,
            updated_at = NOW()
          WHERE id = $6
          RETURNING id
        `,
        name,
        purchaseDate,
        supportedDate,
        amountNumber,
        description,
        numericId,
      );

    const updatedRows = updated as { id: number }[];

    if (!updatedRows.length) {
      return NextResponse.json(
        { success: false, message: "Asset tidak ditemukan" },
        { status: 404 },
      );
    }

    await prisma.$queryRawUnsafe(
      `
        DELETE FROM hrm_asset_employees
        WHERE asset_id = $1
      `,
      numericId,
    );

    for (const empId of employeeIds) {
      await prisma.$queryRawUnsafe(
        `
          INSERT INTO hrm_asset_employees (asset_id, employee_id)
          VALUES ($1, $2)
          ON CONFLICT (asset_id, employee_id) DO NOTHING
        `,
        numericId,
        empId,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Asset berhasil diperbarui",
    });
  } catch (error: any) {
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui asset" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
        { status: 403 },
      );
    }

    const { id } = await params;
    const numericId = Number(id);

    if (Number.isNaN(numericId)) {
      return NextResponse.json(
        { success: false, message: "ID asset tidak valid" },
        { status: 400 },
      );
    }

    await ensureTables();

    const deleted =
      await prisma.$queryRawUnsafe(
        `
          DELETE FROM hrm_assets
          WHERE id = $1
          RETURNING id
        `,
        numericId,
      );

    const deletedRows = deleted as { id: number }[];

    if (!deletedRows.length) {
      return NextResponse.json(
        { success: false, message: "Asset tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Asset berhasil dihapus",
    });
  } catch (error: any) {
    console.error("Error deleting asset:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus asset" },
      { status: 500 },
    );
  }
}

