import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";

function isAllowed(session: { user?: { role?: string } }): boolean {
  const role = session.user?.role;
  return role === "super admin" || role === "company";
}

/**
 * GET /api/userlogs/[id]
 * Get one login detail for view modal.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAllowed(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const log = await prisma.loginDetail.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (!log) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: log.id,
    userId: log.userId,
    userName: log.user.name ?? log.user.email,
    userEmail: log.user.email,
    date: log.date.toISOString(),
    ip: log.ip,
    details: log.details,
  });
}

/**
 * DELETE /api/userlogs/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAllowed(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.loginDetail.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
