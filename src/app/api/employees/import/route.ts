import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const employeeImportSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID wajib diisi"),
  name: z.string().trim().min(1, "Nama karyawan wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().trim().min(1, "Nomor telepon wajib diisi"),
  dateOfBirth: z.string().trim().min(1, "Tanggal lahir wajib diisi"),
  gender: z.string().trim().min(1, "Jenis kelamin wajib diisi"),
  address: z.string().trim().min(1, "Alamat wajib diisi"),
  branch: z.string().trim().min(1, "Cabang wajib dipilih"),
  department: z.string().trim().min(1, "Departemen wajib dipilih"),
  designation: z.string().trim().min(1, "Jabatan wajib dipilih"),
  dateOfJoining: z.string().trim().min(1, "Tanggal bergabung wajib diisi"),
  salaryType: z.string().trim().optional(),
  basicSalary: z.string().trim().optional(),
  accountHolderName: z.string().trim().optional(),
  accountNumber: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  bankIdentifierCode: z.string().trim().optional(),
  branchLocation: z.string().trim().optional(),
  taxPayerId: z.string().trim().optional(),
  isActive: z.string().trim().optional(),
});

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        current += "\"";
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
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

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "File CSV tidak ditemukan" },
        { status: 400 },
      );
    }

    const text = await (file as Blob).text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length <= 1) {
      return NextResponse.json(
        { success: false, message: "File CSV kosong" },
        { status: 400 },
      );
    }

    const headersLine = parseCsvLine(lines[0]).map((h) => h.trim());

    const requiredColumns = [
      "employeeId",
      "name",
      "email",
      "phone",
      "dateOfBirth",
      "gender",
      "address",
      "branch",
      "department",
      "designation",
      "dateOfJoining",
    ];

    const missingColumns = requiredColumns.filter(
      (col) => !headersLine.includes(col),
    );

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Kolom wajib tidak ditemukan di header CSV: ${missingColumns.join(
            ", ",
          )}`,
        },
        { status: 400 },
      );
    }

    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) {
        continue;
      }

      const values = parseCsvLine(line);
      const row: Record<string, string> = {};

      headersLine.forEach((field, index) => {
        row[field] = values[index]?.trim() ?? "";
      });

      const parsed = employeeImportSchema.safeParse(row);
      if (!parsed.success) {
        const message =
          parsed.error.errors[0]?.message ?? "Data employee tidak valid";
        errors.push(`Baris ${i + 1}: ${message}`);
        continue;
      }

      const data = parsed.data;

      const dateOfBirth = new Date(`${data.dateOfBirth}T00:00:00.000Z`);
      const dateOfJoining = new Date(`${data.dateOfJoining}T00:00:00.000Z`);

      const basicSalaryNumber = data.basicSalary
        ? Number(data.basicSalary.replace(/[^0-9.-]/g, ""))
        : null;

      const isActive =
        data.isActive?.toLowerCase() === "false"
          ? false
          : true;

      try {
        await (prisma as any).employee.create({
          data: {
            employeeId: data.employeeId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            dateOfBirth,
            gender: data.gender,
            address: data.address,
            branch: data.branch,
            department: data.department,
            designation: data.designation,
            dateOfJoining,
            isActive,
            salaryType: data.salaryType ?? null,
            basicSalary: basicSalaryNumber,
            documentsCertificate: null,
            documentsPhoto: null,
            accountHolderName: data.accountHolderName ?? null,
            accountNumber: data.accountNumber ?? null,
            bankName: data.bankName ?? null,
            bankIdentifierCode: data.bankIdentifierCode ?? null,
            branchLocation: data.branchLocation ?? null,
            taxPayerId: data.taxPayerId ?? null,
            userId: null,
          },
        });
        importedCount += 1;
      } catch (error: any) {
        if (error.code === "P2002") {
          errors.push(
            `Baris ${i + 1}: Employee dengan ID atau email sudah ada`,
          );
        } else {
          errors.push(
            `Baris ${i + 1}: Gagal menyimpan data employee`,
          );
        }
      }
    }

    if (importedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Tidak ada data employee yang berhasil diimport",
          errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimport ${importedCount} employee`,
      importedCount,
      errors,
    });
  } catch (error) {
    console.error("Error importing employees:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal saat import" },
      { status: 500 },
    );
  }
}

