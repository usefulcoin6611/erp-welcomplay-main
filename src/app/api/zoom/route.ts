import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  projectId: z.string().optional().nullable(),
  startAt: z.string().min(1, "Start date/time is required"),
  durationMinutes: z.number().int().min(5, "Duration must be at least 5 minutes").max(480, "Duration cannot exceed 8 hours"),
  password: z.string().max(100).optional().nullable(),
  syncGoogleCalendar: z.boolean().optional().default(false),
  inviteClient: z.boolean().optional().default(true),
  participantUserIds: z.array(z.string()).default([]),
});

function mapMeeting(m: {
  id: string;
  title: string;
  projectId: string | null;
  startAt: Date;
  durationMinutes: number;
  joinUrl: string | null;
  startUrl: string | null;
  password: string | null;
  status: string;
  createdById: string;
  syncGoogleCalendar: boolean;
  inviteClient: boolean;
  createdAt: Date;
  project: { id: string; name: string; projectId?: string } | null;
  createdBy: { id: string; name: string | null; email: string; image: string | null };
  participants: Array<{ user: { id: string; name: string | null; email: string; image: string | null } }>;
}) {
  const startAt = m.startAt instanceof Date ? m.startAt : new Date(m.startAt);
  return {
    id: m.id,
    title: m.title,
    project: m.project ? { id: m.project.id, name: m.project.name } : null,
    projectId: m.projectId,
    start_date: startAt.toISOString(),
    duration: m.durationMinutes,
    join_url: m.joinUrl ?? undefined,
    start_url: m.startUrl ?? undefined,
    password: m.password ?? undefined,
    status: m.status as "waiting" | "started" | "ended",
    created_by: m.createdById,
    createdBy: {
      id: m.createdBy.id,
      name: m.createdBy.name ?? "",
      email: m.createdBy.email,
      image: m.createdBy.image ?? undefined,
    },
    users: m.participants.map((p) => ({
      id: p.user.id,
      name: p.user.name ?? p.user.email,
      avatar: p.user.image ?? undefined,
    })),
    can_start: true,
    syncGoogleCalendar: m.syncGoogleCalendar,
    inviteClient: m.inviteClient,
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const projectId = url.searchParams.get("projectId")?.trim() || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { project: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (projectId) {
      where.projectId = projectId;
    }

    const meetings = await prisma.zoomMeeting.findMany({
      where,
      orderBy: { startAt: "desc" },
      include: {
        project: { select: { id: true, name: true, projectId: true } },
        createdBy: { select: { id: true, name: true, email: true, image: true } },
        participants: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      },
    });

    const data = meetings.map(mapMeeting);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[GET /api/zoom]", err);
    return NextResponse.json(
      { success: false, message: "Failed to load meetings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const rawBody = await request.json();
    const validation = createSchema.safeParse(rawBody);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      return NextResponse.json(
        {
          success: false,
          message: firstError?.message ?? "Validation failed",
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      title,
      projectId,
      startAt,
      durationMinutes,
      password,
      syncGoogleCalendar,
      inviteClient,
      participantUserIds,
    } = validation.data;

    let resolvedProjectId: string | null = null;
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { OR: [{ id: projectId }, { projectId }] },
      });
      if (!project) {
        return NextResponse.json(
          { success: false, message: "Project not found" },
          { status: 400 }
        );
      }
      resolvedProjectId = project.id;
    }

    const uniqueUserIds = [...new Set([userId, ...participantUserIds])];
    const usersExist = await prisma.user.findMany({
      where: { id: { in: uniqueUserIds } },
      select: { id: true },
    });
    if (usersExist.length !== uniqueUserIds.length) {
      return NextResponse.json(
        { success: false, message: "One or more selected users do not exist" },
        { status: 400 }
      );
    }

    const meeting = await prisma.zoomMeeting.create({
      data: {
        title,
        projectId: resolvedProjectId,
        startAt: new Date(startAt),
        durationMinutes,
        password: password ?? null,
        status: "waiting",
        createdById: userId,
        syncGoogleCalendar: syncGoogleCalendar ?? false,
        inviteClient: inviteClient ?? true,
        joinUrl: "https://zoom.us/j/" + Date.now().toString(36),
        startUrl: "https://zoom.us/s/" + Date.now().toString(36),
        participants: {
          create: uniqueUserIds.map((uid) => ({ userId: uid })),
        },
      },
      include: {
        project: { select: { id: true, name: true, projectId: true } },
        createdBy: { select: { id: true, name: true, email: true, image: true } },
        participants: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      },
    });

    return NextResponse.json(
      { success: true, data: mapMeeting(meeting) },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/zoom]", err);
    return NextResponse.json(
      { success: false, message: "Failed to create meeting" },
      { status: 500 }
    );
  }
}
