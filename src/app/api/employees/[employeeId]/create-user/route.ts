import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

/**
 * POST /api/employees/[employeeId]/create-user
 * Creates a system user for an employee (no password). Password setup stays in User Management.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as {
      role?: string;
      branchId?: string | null;
      departmentId?: string | null;
    };
    const userRole = currentUser.role;
    if (userRole !== "super admin" && userRole !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    const { employeeId } = await params;

    const employee = await (prisma as any).employee.findUnique({
      where: { employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    if (employee.userId) {
      return NextResponse.json(
        { success: false, message: "Employee already has system access" },
        { status: 400 }
      );
    }

    const existingUser = await (prisma as any).user.findUnique({
      where: { email: employee.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this email already exists. Link or manage from User Management.",
        },
        { status: 400 }
      );
    }

    let branchId: string | null = null;
    let departmentId: string | null = null;

    if (userRole === "company" && currentUser.branchId) {
      branchId = currentUser.branchId;
      const deptInBranch = await (prisma as any).department.findFirst({
        where: { name: employee.department, branchId },
      });
      departmentId = deptInBranch?.id ?? currentUser.departmentId ?? null;
    } else {
      const branchRecord = await (prisma as any).branch.findFirst({
        where: { name: employee.branch },
      });
      const departmentRecord = await (prisma as any).department.findFirst({
        where: { name: employee.department },
      });
      branchId = branchRecord?.id ?? null;
      departmentId = departmentRecord?.id ?? null;
    }

    const user = await (prisma as any).user.create({
      data: {
        email: employee.email,
        name: employee.name,
        role: "employee",
        emailVerified: false,
        branchId,
        departmentId,
      },
    });

    await (prisma as any).employee.update({
      where: { id: employee.id },
      data: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: "System user created. Set password from User Management.",
      data: { userId: user.id },
    });
  } catch (error) {
    console.error("Error creating system user for employee:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create system user" },
      { status: 500 }
    );
  }
}
