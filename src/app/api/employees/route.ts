import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";
import * as bcrypt from "bcryptjs";

const createEmployeeSchema = z.object({
  employeeId: z.string().trim().optional(),
  name: z.string().trim().min(1, "Nama karyawan wajib diisi"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().trim().min(1, "Nomor telepon wajib diisi"),
  dateOfBirth: z.string().trim().min(1, "Tanggal lahir wajib diisi"),
  gender: z.enum(["Male", "Female"]),
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
  isActive: z.boolean().optional(),
  password: z.string().trim().min(8, "Password minimal 8 karakter").optional(),
});

async function generateNextEmployeeId() {
  const last = await (prisma as any).employee.findFirst({
    orderBy: { employeeId: "desc" },
  });

  if (!last) {
    return "EMP001";
  }

  const match = last.employeeId.match(/EMP(\d+)/);
  const lastNumber = match ? parseInt(match[1] ?? "0", 10) : 0;
  const nextNumber = lastNumber + 1;

  return `EMP${nextNumber.toString().padStart(3, "0")}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employees = await (prisma as any).employee.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const data = employees.map((e: any) => ({
      id: e.id,
      employeeId: e.employeeId,
      name: e.name,
      email: e.email,
      branch: e.branch,
      department: e.department,
      designation: e.designation,
      dateOfJoining: e.dateOfJoining.toISOString(),
      lastLogin: e.lastLogin ? e.lastLogin.toISOString() : "",
      isActive: e.isActive,
      phone: e.phone,
      dateOfBirth: e.dateOfBirth ? e.dateOfBirth.toISOString() : "",
      gender: e.gender,
      address: e.address,
      salaryType: e.salaryType,
      basicSalary: e.basicSalary,
      accountHolderName: e.accountHolderName,
      accountNumber: e.accountNumber,
      bankName: e.bankName,
      bankIdentifierCode: e.bankIdentifierCode,
      branchLocation: e.branchLocation,
      taxPayerId: e.taxPayerId,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
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
    const validation = createEmployeeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.errors[0]?.message ?? "Data karyawan tidak valid",
          errors: validation.error.format(),
        },
        { status: 400 },
      );
    }

    const data = validation.data;

    const employeeId =
      (data.employeeId && data.employeeId.trim()) ||
      (await generateNextEmployeeId());

    const dateOfBirth = new Date(`${data.dateOfBirth}T00:00:00.000Z`);
    const dateOfJoining = new Date(`${data.dateOfJoining}T00:00:00.000Z`);

    const basicSalaryNumber = data.basicSalary
      ? Number(data.basicSalary.replace(/[^0-9.-]/g, ""))
      : null;

    const existingEmployee = await (prisma as any).employee.findFirst({
      where: { email: data.email },
    });

    if (existingEmployee) {
      return NextResponse.json(
        {
          success: false,
          message: "Employee dengan email ini sudah ada",
        },
        { status: 400 },
      );
    }

    const existingUser = await (prisma as any).user.findUnique({
      where: { email: data.email },
    });

    let userId: string | null = null;

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email sudah digunakan oleh user lain",
        },
        { status: 400 },
      );
    }

    if (!data.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password karyawan wajib diisi",
        },
        { status: 400 },
      );
    }

    {
      const branchRecord = await (prisma as any).branch.findFirst({
        where: { name: data.branch },
      });

      const departmentRecord = await (prisma as any).department.findFirst({
        where: { name: data.department },
      });

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await (prisma as any).user.create({
        data: {
          email: data.email,
          name: data.name,
          role: "employee",
          password: hashedPassword,
          emailVerified: true,
          branchId: branchRecord?.id ?? null,
          departmentId: departmentRecord?.id ?? null,
        },
      });

      await (prisma as any).account.create({
        data: {
          userId: user.id,
          providerId: "credential",
          accountId: data.email,
          password: hashedPassword,
        },
      });

      userId = user.id;
    }

    const employee = await (prisma as any).employee.create({
      data: {
        employeeId,
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
        isActive: data.isActive ?? true,
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
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Employee berhasil dibuat",
      data: employee,
    });
  } catch (error: any) {
    console.error("Error creating employee:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "Employee ID atau email sudah digunakan",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, message: "Gagal membuat employee" },
      { status: 500 },
    );
  }
}
