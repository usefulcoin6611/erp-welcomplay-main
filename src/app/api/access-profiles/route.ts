import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";
import { REFERENCE_PERMISSIONS } from "@/lib/reference-permissions";

const PERMISSION_SET = new Set(REFERENCE_PERMISSIONS.map((p) => p.toLowerCase()));

type SessionUser = { id: string; role?: string; branchId?: string | null };

function isAllowedToManageAccessProfiles(role: string): boolean {
  return role === "super admin" || role === "company";
}

function isInScope(actor: SessionUser, targetBranchId: string): boolean {
  if (actor.role === "super admin") return true;
  if (actor.role === "company") return actor.branchId === targetBranchId;
  return false;
}

function toAccessProfileRow(r: { id: string; name: string; branchId: string; permissions: unknown; description: string | null; createdAt: Date; updatedAt: Date; branch?: { name: string } | null }) {
  return {
    id: r.id,
    name: r.name,
    branchId: r.branchId,
    branchName: r.branch?.name ?? null,
    permissions: Array.isArray(r.permissions) ? r.permissions : [],
    description: r.description ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

const createAccessProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  permissions: z.array(z.string()).default([]),
  description: z.string().optional(),
});

/**
 * GET /api/access-profiles
 * List access profiles. Scope:
 * - Super admin: all, or ?branchId= to filter
 * - Company: only current user's branch
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (!isAllowedToManageAccessProfiles(user.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to manage access profiles" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const branchIdParam = searchParams.get("branchId");

    const where: { branchId?: string } = {};

    if (user.role === "company") {
      if (!user.branchId) {
        return NextResponse.json(
          { success: true, data: [] },
          { status: 200 }
        );
      }
      where.branchId = user.branchId;
    } else if (user.role === "super admin" && branchIdParam) {
      where.branchId = branchIdParam;
    }

    const profiles = await prisma.accessProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { branch: { select: { name: true } } },
    });

    const data = profiles.map(toAccessProfileRow);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching access profiles:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch access profiles" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/access-profiles
 * Create access profile. Company: branchId from session. Super admin: branchId required in body.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = session.user as SessionUser;
    if (!isAllowedToManageAccessProfiles(currentUser.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to create access profiles" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = createAccessProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, permissions, description } = parsed.data;

    const validPermissions = permissions.filter((p) => typeof p === "string" && PERMISSION_SET.has(p.toLowerCase()));
    const uniquePermissions = Array.from(new Set(validPermissions));

    let branchId: string;
    if (currentUser.role === "company") {
      if (!currentUser.branchId) {
        return NextResponse.json(
          { success: false, message: "Your account is not assigned to a branch" },
          { status: 403 }
        );
      }
      branchId = currentUser.branchId;
    } else {
      const bodyBranchId = (body as { branchId?: string }).branchId;
      if (!bodyBranchId || typeof bodyBranchId !== "string") {
        return NextResponse.json(
          { success: false, message: "branchId is required" },
          { status: 400 }
        );
      }
      const branch = await prisma.branch.findUnique({ where: { id: bodyBranchId } });
      if (!branch) {
        return NextResponse.json(
          { success: false, message: "Branch not found" },
          { status: 400 }
        );
      }
      branchId = bodyBranchId;
    }

    const existing = await prisma.accessProfile.findFirst({
      where: { name: name.trim(), branchId },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "An access profile with this name already exists in this branch" },
        { status: 400 }
      );
    }

    const profile = await prisma.accessProfile.create({
      data: {
        name: name.trim(),
        branchId,
        permissions: uniquePermissions,
        description: description?.trim() ?? null,
      },
      include: { branch: { select: { name: true } } },
    });

    return NextResponse.json({
      success: true,
      message: "Access profile created",
      data: toAccessProfileRow(profile),
    });
  } catch (error) {
    console.error("Error creating access profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create access profile" },
      { status: 500 }
    );
  }
}
