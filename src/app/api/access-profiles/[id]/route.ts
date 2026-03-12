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

const updateAccessProfileSchema = z.object({
  name: z.string().min(1).optional(),
  permissions: z.array(z.string()).optional(),
  description: z.string().nullable().optional(),
});

/**
 * GET /api/access-profiles/[id]
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
    if (!isAllowedToManageAccessProfiles(currentUser.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to view access profiles" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const profile = await prisma.accessProfile.findUnique({
      where: { id },
      include: { branch: { select: { name: true } } },
    });

    if (!profile) {
      return NextResponse.json({ success: false, message: "Access profile not found" }, { status: 404 });
    }

    if (!isInScope(currentUser, profile.branchId)) {
      return NextResponse.json({ success: false, message: "Access profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: toAccessProfileRow(profile) });
  } catch (error) {
    console.error("Error fetching access profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch access profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/access-profiles/[id]
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
    if (!isAllowedToManageAccessProfiles(currentUser.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to update access profiles" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const profile = await prisma.accessProfile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ success: false, message: "Access profile not found" }, { status: 404 });
    }

    if (!isInScope(currentUser, profile.branchId)) {
      return NextResponse.json({ success: false, message: "Access profile not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const parsed = updateAccessProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, permissions, description } = parsed.data;

    const updateData: { name?: string; permissions?: string[]; description?: string | null } = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ?? null;
    if (permissions !== undefined) {
      const validPermissions = permissions.filter((p) => typeof p === "string" && PERMISSION_SET.has(p.toLowerCase()));
      updateData.permissions = Array.from(new Set(validPermissions));
    }

    if (Object.keys(updateData).length === 0) {
      const updated = await prisma.accessProfile.findUnique({
        where: { id },
        include: { branch: { select: { name: true } } },
      });
      return NextResponse.json({ success: true, data: updated ? toAccessProfileRow(updated) : null });
    }

    if (updateData.name && updateData.name !== profile.name) {
      const existing = await prisma.accessProfile.findFirst({
        where: { name: updateData.name, branchId: profile.branchId, id: { not: id } },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, message: "An access profile with this name already exists in this branch" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.accessProfile.update({
      where: { id },
      data: updateData,
      include: { branch: { select: { name: true } } },
    });

    return NextResponse.json({
      success: true,
      message: "Access profile updated",
      data: toAccessProfileRow(updated),
    });
  } catch (error) {
    console.error("Error updating access profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update access profile" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/access-profiles/[id]
 * Users with this accessProfileId are set to null (onDelete: SetNull).
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
    if (!isAllowedToManageAccessProfiles(currentUser.role ?? "")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to delete access profiles" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const profile = await prisma.accessProfile.findUnique({ where: { id } });
    if (!profile) {
      return NextResponse.json({ success: false, message: "Access profile not found" }, { status: 404 });
    }

    if (!isInScope(currentUser, profile.branchId)) {
      return NextResponse.json({ success: false, message: "Access profile not found" }, { status: 404 });
    }

    await prisma.accessProfile.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Access profile deleted" });
  } catch (error) {
    console.error("Error deleting access profile:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete access profile" },
      { status: 500 }
    );
  }
}
