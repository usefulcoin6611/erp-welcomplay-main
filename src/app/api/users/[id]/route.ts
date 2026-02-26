import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";
import * as bcrypt from "bcryptjs";

const ROLES = ["super admin", "company", "client", "employee"] as const;

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  role: z.enum(ROLES).optional(),
  branchId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  accessProfileId: z.string().nullable().optional(),
});

type SessionUser = { id: string; role?: string; branchId?: string | null; departmentId?: string | null };

function isAllowedToAccessUserManagement(role: string): boolean {
  return role === "super admin" || role === "company";
}

function isInScope(actor: SessionUser, targetBranchId: string | null): boolean {
  if (actor.role === "super admin") return true;
  if (actor.role === "company") return (actor.branchId ?? null) === (targetBranchId ?? null);
  return false;
}

function canSetRole(actorRole: string, newRole: string): boolean {
  if (actorRole === "super admin") return true;
  if (actorRole === "company") return newRole === "employee" || newRole === "client";
  return false;
}

function toUserRow(u: {
  id: string;
  name: string | null;
  email: string;
  role: string;
  branchId: string | null;
  departmentId: string | null;
  accessProfileId: string | null;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  branch?: { name: string } | null;
  department?: { name: string } | null;
  accessProfile?: { id: string; name: string } | null;
  sessions?: { createdAt: Date }[];
}) {
  const lastSession = u.sessions?.[0];
  const lastLoginAt = lastSession ? lastSession.createdAt.toISOString() : null;
  return {
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    role: u.role,
    branchId: u.branchId,
    departmentId: u.departmentId,
    accessProfileId: u.accessProfileId ?? null,
    accessProfileName: u.accessProfile?.name ?? null,
    branchName: u.branch?.name ?? null,
    departmentName: u.department?.name ?? null,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    lastLoginAt,
    lastActivityAt: lastLoginAt ?? u.updatedAt.toISOString(),
  };
}

/**
 * GET /api/users/[id]
 * Get one user. Company can only get users in the same branch.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as SessionUser;
    if (!isAllowedToAccessUserManagement(currentUser.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to view users" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        branch: { select: { name: true } },
        department: { select: { name: true } },
        accessProfile: { select: { id: true, name: true } },
        sessions: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (!isInScope(currentUser, user.branchId)) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: toUserRow(user),
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Update user. Company can only update users in the same branch and cannot set role to super admin or company.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as SessionUser;
    if (!isAllowedToAccessUserManagement(currentUser.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to update users" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (!isInScope(currentUser, existing.branchId)) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password, role, branchId, departmentId, accessProfileId } = parsed.data;

    if (role !== undefined && !canSetRole(currentUser.role ?? "", role)) {
      return NextResponse.json(
        { success: false, message: "You cannot assign this role" },
        { status: 403 }
      );
    }

    if (email !== undefined && email !== existing.email) {
      const duplicate = await prisma.user.findUnique({ where: { email } });
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "A user with this email already exists" },
          { status: 400 }
        );
      }
    }

    let finalBranchId: string | null | undefined = branchId;
    let finalDepartmentId: string | null | undefined = departmentId;

    if (currentUser.role === "company") {
      finalBranchId = currentUser.branchId ?? null;
      if (departmentId) {
        const dept = await prisma.department.findFirst({
          where: { id: departmentId, branchId: currentUser.branchId ?? undefined },
        });
        finalDepartmentId = dept ? departmentId : existing.departmentId;
      }
    }

    const finalBranchIdForProfile = finalBranchId ?? existing.branchId;
    let finalAccessProfileId: string | null | undefined = accessProfileId;
    if (accessProfileId !== undefined) {
      if (!accessProfileId || !accessProfileId.trim()) {
        finalAccessProfileId = null;
      } else {
        const profile = await prisma.accessProfile.findUnique({
          where: { id: accessProfileId },
        });
        if (!profile) {
          return NextResponse.json(
            { success: false, message: "Selected access profile not found" },
            { status: 400 }
          );
        }
        if (profile.branchId !== (finalBranchIdForProfile ?? "")) {
          return NextResponse.json(
            { success: false, message: "Selected access profile must belong to the user's branch" },
            { status: 400 }
          );
        }
        finalAccessProfileId = profile.id;
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (finalBranchId !== undefined) updateData.branchId = finalBranchId;
    if (finalDepartmentId !== undefined) updateData.departmentId = finalDepartmentId;
    if (finalAccessProfileId !== undefined) updateData.accessProfileId = finalAccessProfileId;

    if (password !== undefined && password !== "") {
      const hashed = await bcrypt.hash(password, 10);
      updateData.password = hashed;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        branch: { select: { name: true } },
        department: { select: { name: true } },
        accessProfile: { select: { id: true, name: true } },
        sessions: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    });

    if (password !== undefined && password !== "") {
      const hashed = await bcrypt.hash(password, 10);
      await prisma.account.upsert({
        where: {
          providerId_accountId: { providerId: "credential", accountId: updated.email },
        },
        update: { password: hashed, userId: updated.id },
        create: {
          userId: updated.id,
          providerId: "credential",
          accountId: updated.email,
          password: hashed,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "User updated",
      data: toUserRow(updated),
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Delete user. Cannot delete self. Company can only delete users in the same branch.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as SessionUser;
    if (!isAllowedToAccessUserManagement(currentUser.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to delete users" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (id === currentUser.id) {
      return NextResponse.json(
        { success: false, message: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    if (!isInScope(currentUser, existing.branchId)) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
