import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

type AssetRow = {
  id: number;
  name: string;
  purchase_date: Date | null;
  supported_date: Date | null;
  amount: number | null;
  description: string | null;
  employees: { id: string; name: string }[] | null;
};

type AssetResponse = {
  id: number;
  name: string;
  purchaseDate: string;
  supportedDate: string;
  amount: number;
  description: string | null;
  employeeIds: string[];
  employees: { id: string; name: string }[];
};

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

function toDateOnlyString(value: Date | null): string {
  if (!value) return "";
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureTables();

    const rows = await prisma.$queryRaw<AssetRow[]>`
      SELECT
        a.id,
        a.name,
        a.purchase_date,
        a.supported_date,
        a.amount,
        a.description,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', e.id,
              'name', e.name
            )
          ) FILTER (WHERE e.id IS NOT NULL),
          '[]'
        ) AS employees
      FROM hrm_assets a
      LEFT JOIN hrm_asset_employees ae ON ae.asset_id = a.id
      LEFT JOIN employee e ON e.id = ae.employee_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `;

    const data: AssetResponse[] = rows.map((row) => {
      const employees = (row.employees ?? []) as { id: string; name: string }[];
      return {
        id: row.id,
        name: row.name,
        purchaseDate: toDateOnlyString(row.purchase_date),
        supportedDate: toDateOnlyString(row.supported_date),
        amount: Number(row.amount ?? 0),
        description: row.description,
        employeeIds: employees.map((e) => e.id),
        employees,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data asset" },
      { status: 500 },
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
        { status: 403 },
      );
    }

    const body = await request.json();

    const name: string = String(body.name ?? "").trim();
    const employeeIds: string[] = Array.isArray(body.employeeIds)
      ? body.employeeIds.map((id: unknown) => String(id))
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
      select: { id: true, name: true },
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

    const insertedAssets = await prisma.$queryRaw<
      { id: number }[]
    >`
      INSERT INTO hrm_assets (name, purchase_date, supported_date, amount, description)
      VALUES (${name}, ${purchaseDate}, ${supportedDate}, ${amountNumber}, ${description})
      RETURNING id
    `;

    const assetId = insertedAssets[0]?.id;

    if (!assetId) {
      return NextResponse.json(
        { success: false, message: "Gagal membuat asset" },
        { status: 500 },
      );
    }

    for (const emp of employees) {
      await prisma.$queryRawUnsafe(
        `
          INSERT INTO hrm_asset_employees (asset_id, employee_id)
          VALUES ($1, $2)
          ON CONFLICT (asset_id, employee_id) DO NOTHING
        `,
        assetId,
        emp.id,
      );
    }

    return NextResponse.json({
      success: true,
      message: "Asset berhasil dibuat",
    });
  } catch (error: any) {
    console.error("Error creating asset:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat asset" },
      { status: 500 },
    );
  }
}

