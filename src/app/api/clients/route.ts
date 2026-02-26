import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";
import * as bcrypt from "bcryptjs";

const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  login_enable: z.boolean().optional().default(false),
  branchId: z.string().optional().nullable(),
});

const CLIENT_ROLE = "client";

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

/**
 * GET /api/clients
 * List users with role "client". Scoped by branch for company role.
 * Includes lastLoginAt and optional deals_count / projects_count (matched by client name on Deal/Project).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as SessionUser;
    if (!isAllowedToManageClients(currentUser.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to manage clients" },
        { status: 403 }
      );
    }

    const where: { role: string; branchId?: string | null } = { role: CLIENT_ROLE };
    if (currentUser.role === "company") {
      where.branchId = currentUser.branchId ?? null;
    }

    const clients = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

    // Optional: deals_count and projects_count by matching Deal.client / Project.clientName to user name or email
    const branchIds = [...new Set(clients.map((c) => c.branchId).filter(Boolean))] as string[];
    const namesAndEmails = [...new Set(clients.flatMap((c) => [c.name ?? "", c.email]).filter(Boolean))];

    let dealCountByKey: Record<string, number> = {};
    let projectCountByKey: Record<string, number> = {};

    if (branchIds.length > 0 && namesAndEmails.length > 0) {
      const deals = await prisma.deal.findMany({
        where: {
          branchId: { in: branchIds },
          client: { in: namesAndEmails, not: null },
        },
        select: { client: true, branchId: true },
      });
      for (const d of deals) {
        if (d.client && d.branchId) {
          const key = `${d.branchId}:${d.client}`;
          dealCountByKey[key] = (dealCountByKey[key] ?? 0) + 1;
        }
      }

      const projects = await prisma.project.findMany({
        where: {
          branchId: { in: branchIds },
          clientName: { in: namesAndEmails, not: null },
        },
        select: { clientName: true, branchId: true },
      });
      for (const p of projects) {
        if (p.clientName && p.branchId) {
          const key = `${p.branchId}:${p.clientName}`;
          projectCountByKey[key] = (projectCountByKey[key] ?? 0) + 1;
        }
      }
    }

    const emails = clients.map((c) => c.email);
    const credentialAccounts = await prisma.account.findMany({
      where: { providerId: "credential", accountId: { in: emails } },
      select: { accountId: true },
    });
    const loginEnabledEmails = new Set(credentialAccounts.map((a) => a.accountId));

    const data = clients.map((u) => {
      const nameOrEmail = u.name ?? u.email;
      const branchId = u.branchId ?? "";
      const deals_count = nameOrEmail ? dealCountByKey[`${branchId}:${nameOrEmail}`] ?? 0 : 0;
      const projects_count = nameOrEmail ? projectCountByKey[`${branchId}:${nameOrEmail}`] ?? 0 : 0;
      return toClientRow(u, {
        deals_count,
        projects_count,
        is_enable_login: loginEnabledEmails.has(u.email),
      });
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clients
 * Create a user with role "client". Company is forced to own branch.
 * If login_enable and password provided, creates credential account for login.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as SessionUser;
    if (!isAllowedToManageClients(currentUser.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to create clients" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = createClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password, login_enable, branchId } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "A user with this email already exists" },
        { status: 400 }
      );
    }

    const finalBranchId =
      currentUser.role === "company"
        ? currentUser.branchId ?? null
        : (branchId ?? null);

    const hashedPassword =
      login_enable && password && password.trim()
        ? await bcrypt.hash(password.trim(), 10)
        : null;

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        role: CLIENT_ROLE,
        branchId: finalBranchId,
        password: hashedPassword,
        emailVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        branchId: true,
        updatedAt: true,
        sessions: { take: 0 },
      },
    });

    if (hashedPassword) {
      await prisma.account.upsert({
        where: {
          providerId_accountId: { providerId: "credential", accountId: newUser.email },
        },
        update: { userId: newUser.id, password: hashedPassword },
        create: {
          userId: newUser.id,
          providerId: "credential",
          accountId: newUser.email,
          password: hashedPassword,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Client created",
      data: toClientRow(
        { ...newUser, sessions: [] },
        { is_enable_login: !!hashedPassword }
      ),
    });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create client" },
      { status: 500 }
    );
  }
}
