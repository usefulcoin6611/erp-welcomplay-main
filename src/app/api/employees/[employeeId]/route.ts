import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";
import * as bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    const documentTypes = await (prisma as any).documentType.findMany({
      orderBy: { createdAt: "asc" },
    });

    let employeeDocuments: any[] = [];

    try {
      employeeDocuments = await (prisma as any).employeeDocument.findMany({
        where: { employeeId: employee.id },
      });
    } catch (err) {
      console.error("Error fetching employee documents:", err);
      employeeDocuments = [];
    }

    const documents = documentTypes.map((dt: any) => {
      const doc = employeeDocuments.find(
        (d: any) => d.documentTypeId === dt.id,
      );

      return {
        documentTypeId: dt.id,
        name: dt.name,
        requiredField: dt.requiredField,
        filePath: doc?.filePath ?? null,
        fileName: doc?.fileName ?? null,
        mimeType: doc?.mimeType ?? null,
        fileSize: doc?.fileSize ?? null,
      };
    });

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
        documents,
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

    const validation = updateEmployeeSchema.safeParse(rawData);

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
    } else if (existingUserForEmployee) {
      await (prisma as any).user.update({
        where: { id: existingUserForEmployee.id },
        data: {
          email: data.email,
          name: data.name,
        },
      });
    }

    let nextDocumentsCertificate: string | null | undefined = undefined;
    let nextDocumentsPhoto: string | null | undefined = undefined;

    if (formData) {
      const documentTypes = await (prisma as any).documentType.findMany({
        orderBy: { createdAt: "asc" },
      });

      const hasEmployeeDocumentModel = Boolean(
        (prisma as any).employeeDocument,
      );

      const existingDocuments = hasEmployeeDocumentModel
        ? await (prisma as any).employeeDocument.findMany({
            where: { employeeId: existingEmployee.id },
          })
        : [];

      for (const dt of documentTypes as any[]) {
        const key = `document_${dt.id}`;
        const removeKey = `document_${dt.id}_removed`;

        const file = formData.get(key) as File | null;
        const removed = formData.get(removeKey) === "true";

        const existing = existingDocuments.find(
          (d: any) => d.documentTypeId === dt.id,
        );

        if (file && file.size > 0) {
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

            if (hasEmployeeDocumentModel) {
              if (existing) {
                await (prisma as any).employeeDocument.update({
                  where: { id: existing.id },
                  data: {
                    filePath,
                    fileName: file.name,
                    mimeType: file.type,
                    fileSize: file.size,
                  },
                });
              } else {
                await (prisma as any).employeeDocument.create({
                  data: {
                    employeeId: existingEmployee.id,
                    documentTypeId: dt.id,
                    filePath,
                    fileName: file.name,
                    mimeType: file.type,
                    fileSize: file.size,
                  },
                });
              }
            }

            if (isImage) {
              nextDocumentsPhoto = filePath;
            } else if (nextDocumentsCertificate === undefined) {
              nextDocumentsCertificate = filePath;
            }
          } catch (err) {
            console.error(
              `Error saving employee document file for type ${dt.name}:`,
              err,
            );
          }
        } else if (removed && existing && hasEmployeeDocumentModel) {
          await (prisma as any).employeeDocument.update({
            where: { id: existing.id },
            data: { filePath: null },
          });

          const nameLower = String(dt.name ?? "").toLowerCase();
          if (
            nameLower.includes("photo") ||
            nameLower.includes("foto") ||
            nameLower.includes("image")
          ) {
            nextDocumentsPhoto = null;
          }
        }
      }
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
        documentsCertificate:
          nextDocumentsCertificate !== undefined
            ? nextDocumentsCertificate
            : existingEmployee.documentsCertificate,
        documentsPhoto:
          nextDocumentsPhoto !== undefined
            ? nextDocumentsPhoto
            : existingEmployee.documentsPhoto,
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
