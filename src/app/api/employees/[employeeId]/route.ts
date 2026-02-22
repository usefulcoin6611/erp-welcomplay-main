import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";
import * as bcrypt from "bcryptjs";

const updateEmployeeSchema = z.object({
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  try {
    const { employeeId } = await params;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const employee = await (prisma as any).employee.findUnique({
      where: { employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        dateOfBirth: employee.dateOfBirth.toISOString().split("T")[0],
        gender: employee.gender,
        address: employee.address,
        branch: employee.branch,
        department: employee.department,
        designation: employee.designation,
        dateOfJoining: employee.dateOfJoining.toISOString().split("T")[0],
        lastLogin: employee.lastLogin
          ? employee.lastLogin.toISOString()
          : null,
        isActive: employee.isActive,
        salaryType: employee.salaryType,
        basicSalary: employee.basicSalary,
        documentsCertificate: employee.documentsCertificate,
        documentsPhoto: employee.documentsPhoto,
        accountHolderName: employee.accountHolderName,
        accountNumber: employee.accountNumber,
        bankName: employee.bankName,
        bankIdentifierCode: employee.bankIdentifierCode,
        branchLocation: employee.branchLocation,
        taxPayerId: employee.taxPayerId,
      },
    });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data employee" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  try {
    const { employeeId } = await params;
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
    const validation = updateEmployeeSchema.safeParse(body);

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

    const dateOfBirth = new Date(`${data.dateOfBirth}T00:00:00.000Z`);
    const dateOfJoining = new Date(`${data.dateOfJoining}T00:00:00.000Z`);

    const basicSalaryNumber = data.basicSalary
      ? Number(data.basicSalary.replace(/[^0-9.-]/g, ""))
      : null;
    const existingEmployee = await (prisma as any).employee.findUnique({
      where: { employeeId },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { success: false, message: "Employee tidak ditemukan" },
        { status: 404 },
      );
    }

    const existingUserForEmployee = existingEmployee.userId
      ? await (prisma as any).user.findUnique({
          where: { id: existingEmployee.userId },
        })
      : null;

    if (existingUserForEmployee) {
      const userWithNewEmail = await (prisma as any).user.findUnique({
        where: { email: data.email },
      });

      if (userWithNewEmail && userWithNewEmail.id !== existingUserForEmployee.id) {
        return NextResponse.json(
          {
            success: false,
            message: "Email sudah digunakan oleh user lain",
          },
          { status: 400 },
        );
      }
    }

    let userId: string | null = existingEmployee.userId ?? null;

    if (data.password) {
      if (existingUserForEmployee) {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await (prisma as any).user.update({
          where: { id: existingUserForEmployee.id },
          data: {
            email: data.email,
            name: data.name,
          },
        });

        await (prisma as any).account.upsert({
          where: {
            providerId_accountId: {
              providerId: "credential",
              accountId: existingEmployee.email,
            },
          },
          update: {
            userId: user.id,
            accountId: data.email,
            password: hashedPassword,
          },
          create: {
            userId: user.id,
            providerId: "credential",
            accountId: data.email,
            password: hashedPassword,
          },
        });

        userId = user.id;
      } else {
        const existingUserWithEmail = await (prisma as any).user.findUnique({
          where: { email: data.email },
        });

        if (existingUserWithEmail) {
          return NextResponse.json(
            {
              success: false,
              message: "Email sudah digunakan oleh user lain",
            },
            { status: 400 },
          );
        }

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
    } else if (existingUserForEmployee) {
      await (prisma as any).user.update({
        where: { id: existingUserForEmployee.id },
        data: {
          email: data.email,
          name: data.name,
        },
      });
    }

    const employee = await (prisma as any).employee.update({
      where: { employeeId },
      data: {
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
      message: "Employee berhasil diperbarui",
      data: employee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui employee" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  try {
    const { employeeId } = await params;
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

    await (prisma as any).employee.delete({
      where: { employeeId },
    });

    return NextResponse.json({
      success: true,
      message: "Employee berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus employee" },
      { status: 500 },
    );
  }
}
