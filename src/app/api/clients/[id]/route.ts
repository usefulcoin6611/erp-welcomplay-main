import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";
import * as bcrypt from "bcryptjs";

const CLIENT_ROLE = "client";

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().optional(),
  login_enable: z.boolean().optional(),
});

type SessionUser = { id: string; role?: string; branchId?: string | null };

function isAllowedToManageClients(role: string): boolean {
  return role === "super admin" || role === "company";
}

function isInScope(actor: SessionUser, targetBranchId: string | null): boolean {
  if (actor.role === "super admin") return true;
  if (actor.role === "company") return (actor.branchId ?? null) === (targetBranchId ?? null);
  return false;
}

function toClientRow(
  u: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
    branchId: string | null;
    updatedAt: Date;
    sessions?: { createdAt: Date }[];
  },
  opts?: { deals_count?: number; projects_count?: number; is_enable_login?: boolean }
) {
  const lastSession = u.sessions?.[0];
  const lastLoginAt = lastSession ? lastSession.createdAt.toISOString() : null;
  return {
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    avatar: u.image ?? null,
    lastLoginAt,
    lastActivityAt: lastLoginAt ?? u.updatedAt.toISOString(),
    deals_count: opts?.deals_count ?? 0,
    projects_count: opts?.projects_count ?? 0,
    is_enable_login: opts?.is_enable_login ?? false,
  };
}

async function getDealsAndProjectsCount(
  branchId: string | null,
  nameOrEmail: string
): Promise<{ deals_count: number; projects_count: number }> {
  if (!nameOrEmail) return { deals_count: 0, projects_count: 0 };
  const branchFilter = branchId ? { branchId } : { branchId: null };
  const [deals_count, projects_count] = await Promise.all([
    prisma.deal.count({
      where: { ...branchFilter, client: nameOrEmail },
    }),
    prisma.project.count({
      where: { ...branchFilter, clientName: nameOrEmail },
    }),
  ]);
  return { deals_count, projects_count };
}

/**
 * GET /api/clients/[id]
 * Get one client (user with role client). Company can only get clients in the same branch.
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
    if (!isAllowedToManageClients(currentUser.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to view clients" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        branchId: true,
        role: true,
        updatedAt: true,
        sessions: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    });

    if (!user || user.role !== CLIENT_ROLE) {
      return NextResponse.json({ success: false, message: "Client not found" }, { status: 404 });
    }

    if (!isInScope(currentUser, user.branchId)) {
      return NextResponse.json({ success: false, message: "Client not found" }, { status: 404 });
    }

    const nameOrEmail = user.name ?? user.email;
    const [counts, credentialAccount] = await Promise.all([
      getDealsAndProjectsCount(user.branchId, nameOrEmail),
      prisma.account.findUnique({
        where: {
          providerId_accountId: { providerId: "credential", accountId: user.email },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: toClientRow(user, {
        ...counts,
        is_enable_login: !!credentialAccount,
      }),
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clients/[id]
 * Update client. Company can only update clients in the same branch.
 * login_enable: false removes credential account (disables login); true + password sets/updates credential.
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
    if (!isAllowedToManageClients(currentUser.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to update clients" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.role !== CLIENT_ROLE) {
      return NextResponse.json({ success: false, message: "Client not found" }, { status: 404 });
    }

    if (!isInScope(currentUser, existing.branchId)) {
      return NextResponse.json({ success: false, message: "Client not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = updateClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password, login_enable } = parsed.data;

    if (email !== undefined && email !== existing.email) {
      const duplicate = await prisma.user.findUnique({ where: { email } });
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: "A user with this email already exists" },
          { status: 400 }
        );
      }
    }

    const updateData: { name?: string; email?: string; password?: string | null } = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    if (password !== undefined && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        branchId: true,
        updatedAt: true,
        sessions: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      },
    });

    const oldEmail = existing.email;
    const newEmail = updated.email;
    const credentialAccountOld = await prisma.account.findUnique({
      where: {
        providerId_accountId: { providerId: "credential", accountId: oldEmail },
      },
    });

    if (login_enable === false) {
      if (credentialAccountOld) {
        await prisma.account.delete({ where: { id: credentialAccountOld.id } });
      }
    } else if (login_enable === true || (password !== undefined && password.trim() !== "")) {
      const hashed = updateData.password ?? (credentialAccountOld?.password ?? null);
      if (hashed) {
        if (newEmail !== oldEmail && credentialAccountOld) {
          await prisma.account.delete({ where: { id: credentialAccountOld.id } });
        }
        await prisma.account.upsert({
          where: {
            providerId_accountId: { providerId: "credential", accountId: newEmail },
          },
          update: { userId: updated.id, password: hashed },
          create: {
            userId: updated.id,
            providerId: "credential",
            accountId: newEmail,
            password: hashed,
          },
        });
      }
    } else if (email !== undefined && newEmail !== oldEmail && credentialAccountOld) {
      await prisma.account.delete({ where: { id: credentialAccountOld.id } });
      await prisma.account.create({
        data: {
          userId: updated.id,
          providerId: "credential",
          accountId: newEmail,
          password: credentialAccountOld.password ?? "",
        },
      });
    }

    const nameOrEmail = updated.name ?? updated.email;
    const [counts, credentialAccount] = await Promise.all([
      getDealsAndProjectsCount(updated.branchId, nameOrEmail),
      prisma.account.findUnique({
        where: {
          providerId_accountId: { providerId: "credential", accountId: updated.email },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Client updated",
      data: toClientRow(updated, {
        ...counts,
        is_enable_login: !!credentialAccount,
      }),
    });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update client" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clients/[id]
 * Delete client (user with role client). Company can only delete clients in the same branch.
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
    if (!isAllowedToManageClients(currentUser.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to delete clients" },
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
    if (!existing || existing.role !== CLIENT_ROLE) {
      return NextResponse.json({ success: false, message: "Client not found" }, { status: 404 });
    }

    if (!isInScope(currentUser, existing.branchId)) {
      return NextResponse.json({ success: false, message: "Client not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Client deleted" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete client" },
      { status: 500 }
    );
  }
}
