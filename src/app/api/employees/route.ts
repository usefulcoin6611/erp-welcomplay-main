import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    const currentUser = session.user as { role?: string; branchId?: string | null; departmentId?: string | null };
    const userRole = currentUser.role;
    if (userRole !== "super admin" && userRole !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 },
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let rawData: any = {};
    let formData: FormData | null = null;

    if (contentType.includes("multipart/form-data")) {
      formData = await request.formData();

      rawData = {
        employeeId: (formData.get("employeeId") as string | null) ?? undefined,
        name: (formData.get("name") as string | null) ?? "",
        email: (formData.get("email") as string | null) ?? "",
        phone: (formData.get("phone") as string | null) ?? "",
        dateOfBirth: (formData.get("dateOfBirth") as string | null) ?? "",
        gender: (formData.get("gender") as string | null) ?? "",
        address: (formData.get("address") as string | null) ?? "",
        branch: (formData.get("branch") as string | null) ?? "",
        department: (formData.get("department") as string | null) ?? "",
        designation: (formData.get("designation") as string | null) ?? "",
        dateOfJoining: (formData.get("dateOfJoining") as string | null) ?? "",
        salaryType: (formData.get("salaryType") as string | null) ?? undefined,
        basicSalary: (formData.get("basicSalary") as string | null) ?? undefined,
        accountHolderName:
          (formData.get("accountHolderName") as string | null) ?? undefined,
        accountNumber:
          (formData.get("accountNumber") as string | null) ?? undefined,
        bankName: (formData.get("bankName") as string | null) ?? undefined,
        bankIdentifierCode:
          (formData.get("bankIdentifierCode") as string | null) ?? undefined,
        branchLocation:
          (formData.get("branchLocation") as string | null) ?? undefined,
        taxPayerId: (formData.get("taxPayerId") as string | null) ?? undefined,
        isActive: formData.has("isActive")
          ? (formData.get("isActive") as string) === "true"
          : undefined,
        password: (formData.get("password") as string | null) ?? undefined,
      };
    } else {
      const body = await request.json();
      rawData = body || {};
    }

    const validation = createEmployeeSchema.safeParse(rawData);

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
      // Business logic: /users lists users by branchId. When company creates an employee here,
      // the new User must have the same branchId so they appear on /users. Super admin can
      // assign any branch/department by name.
      let branchId: string | null = null;
      let departmentId: string | null = null;

      if (userRole === "company" && currentUser.branchId) {
        branchId = currentUser.branchId;
        const deptInBranch = await (prisma as any).department.findFirst({
          where: { name: data.department, branchId },
        });
        departmentId = deptInBranch?.id ?? currentUser.departmentId ?? null;
      } else {
        const branchRecord = await (prisma as any).branch.findFirst({
          where: { name: data.branch },
        });
        const departmentRecord = await (prisma as any).department.findFirst({
          where: { name: data.department },
        });
        branchId = branchRecord?.id ?? null;
        departmentId = departmentRecord?.id ?? null;
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await (prisma as any).user.create({
        data: {
          email: data.email,
          name: data.name,
          role: "employee",
          password: hashedPassword,
          emailVerified: true,
          branchId,
          departmentId,
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

    const savedDocuments: {
      documentTypeId: string;
      filePath: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
      isImage: boolean;
    }[] = [];

    if (formData) {
      const documentTypes = await (prisma as any).documentType.findMany({
        orderBy: { createdAt: "asc" },
      });

      for (const dt of documentTypes as any[]) {
        const key = `document_${dt.id}`;
        const file = formData.get(key) as File | null;

        if (!file || file.size === 0) {
          if (dt.requiredField) {
            return NextResponse.json(
              {
                success: false,
                message: `Dokumen ${dt.name} wajib diupload`,
              },
              { status: 400 },
            );
          }
          continue;
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = file.name.replace(/\s/g, "_");
        const shortPrefix = Date.now().toString(36);
        const filename = `${shortPrefix}_${safeName}`;
        const uploadDir = path.join(
          process.cwd(),
          "public/uploads/employees",
        );

        try {
          await mkdir(uploadDir, { recursive: true });
          await writeFile(path.join(uploadDir, filename), buffer);
          const filePath = `/uploads/employees/${filename}`;
          const isImage = file.type.startsWith("image/");

          savedDocuments.push({
            documentTypeId: dt.id,
            filePath,
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            isImage,
          });
        } catch (err) {
          console.error(
            `Error saving employee document file for type ${dt.name}:`,
            err,
          );
        }
      }
    }

    const firstImageDoc = savedDocuments.find(d => d.isImage);
    const firstNonImageDoc = savedDocuments.find(d => !d.isImage);

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
        documentsCertificate: firstNonImageDoc?.filePath ?? null,
        documentsPhoto: firstImageDoc?.filePath ?? null,
        accountHolderName: data.accountHolderName ?? null,
        accountNumber: data.accountNumber ?? null,
        bankName: data.bankName ?? null,
        bankIdentifierCode: data.bankIdentifierCode ?? null,
        branchLocation: data.branchLocation ?? null,
        taxPayerId: data.taxPayerId ?? null,
        userId,
      },
    });

    if (savedDocuments.length > 0 && (prisma as any).employeeDocument) {
      try {
        await (prisma as any).employeeDocument.createMany({
          data: savedDocuments.map(d => ({
            employeeId: employee.id,
            documentTypeId: d.documentTypeId,
            filePath: d.filePath,
            fileName: d.fileName,
            mimeType: d.mimeType,
            fileSize: d.fileSize,
          })),
        });
      } catch (err) {
        console.error("Error creating employee documents:", err);
      }
    }

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
