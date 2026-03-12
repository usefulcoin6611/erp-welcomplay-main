import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";
import * as bcrypt from "bcryptjs";

const ROLES = ["super admin", "company", "client", "employee"] as const;

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  role: z.enum(ROLES, { required_error: "Role is required" }),
  branchId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
  accessProfileId: z.string().optional().nullable(),
});

type SessionUser = { id: string; role?: string; branchId?: string | null; departmentId?: string | null };

function isAllowedToAccessUserManagement(role: string): boolean {
  return role === "super admin" || role === "company";
}

function canCreateRole(actorRole: string, targetRole: string): boolean {
  if (actorRole === "super admin") return true;
  if (actorRole === "company") return targetRole === "employee" || targetRole === "client";
  return false;
}

function isInScope(actor: SessionUser, targetBranchId: string | null): boolean {
  if (actor.role === "super admin") return true;
  if (actor.role === "company") return (actor.branchId ?? null) === (targetBranchId ?? null);
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
 * GET /api/users
 * List users. Scope depends on role:
 * - Super admin: all users, or view=companies to get only company role
 * - Company: only users in the same branch
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!isAllowedToAccessUserManagement(user.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to manage users" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view"); // "companies" for super admin to see only company-role users

    const where: Record<string, unknown> = {};

    if (user.role === "company") {
      // Company: only employees in the same branch (clients are managed on /clients)
      where.branchId = user.branchId ?? null;
      where.role = "employee";
    } else if (user.role === "super admin" && view === "companies") {
      where.role = "company";
    } else if (user.role === "super admin") {
      // Super admin default list: only employees (clients are on /clients)
      where.role = "employee";
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        branch: { select: { name: true } },
        department: { select: { name: true } },
        accessProfile: { select: { id: true, name: true } },
        sessions: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    });

    const data = users.map((u) => ({
      ...toUserRow(u),
      sessions: undefined,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create user. Role-based rules:
 * - Super admin: can create any role; branchId/departmentId optional
 * - Company: can only create employee or client; branchId forced to current user's branch
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as SessionUser;
    if (!isAllowedToAccessUserManagement(currentUser.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to create users" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password, role, branchId, departmentId, accessProfileId } = parsed.data;

    if (!canCreateRole(currentUser.role ?? "", role)) {
      return NextResponse.json(
        { success: false, message: "You can only create users with role employee or client" },
        { status: 403 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists" },
        { status: 400 }
      );
    }

    let finalBranchId: string | null = null;
    let finalDepartmentId: string | null = null;

    if (currentUser.role === "super admin") {
      finalBranchId = branchId ?? null;
      finalDepartmentId = departmentId ?? null;
    } else {
      // Company: force own branch
      finalBranchId = currentUser.branchId ?? null;
      if (departmentId) {
        const dept = await prisma.department.findFirst({
          where: { id: departmentId, branchId: finalBranchId ?? undefined },
        });
        if (dept) finalDepartmentId = departmentId;
      }
    }

    let finalAccessProfileId: string | null = null;
    if (accessProfileId && accessProfileId.trim()) {
      const profile = await prisma.accessProfile.findUnique({
        where: { id: accessProfileId },
      });
      if (!profile) {
        return NextResponse.json(
          { success: false, message: "Selected access profile not found" },
          { status: 400 }
        );
      }
      if (profile.branchId !== (finalBranchId ?? "")) {
        return NextResponse.json(
          { success: false, message: "Selected access profile must belong to the user's branch" },
          { status: 400 }
        );
      }
      finalAccessProfileId = profile.id;
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        branchId: finalBranchId,
        departmentId: finalDepartmentId,
        accessProfileId: finalAccessProfileId,
        password: hashedPassword,
        emailVerified: false,
      },
      include: {
        branch: { select: { name: true } },
        department: { select: { name: true } },
        accessProfile: { select: { id: true, name: true } },
        sessions: { take: 0 },
      },
    });

    if (hashedPassword) {
      await prisma.account.upsert({
        where: {
          providerId_accountId: { providerId: "credential", accountId: email },
        },
        update: { userId: newUser.id, password: hashedPassword },
        create: {
          userId: newUser.id,
          providerId: "credential",
          accountId: email,
          password: hashedPassword,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "User created",
      data: toUserRow({ ...newUser, sessions: [] }),
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 }
    );
  }
}
