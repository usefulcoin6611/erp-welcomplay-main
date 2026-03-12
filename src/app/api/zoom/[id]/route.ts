import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long").optional(),
  projectId: z.string().optional().nullable(),
  startAt: z.string().min(1).optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  password: z.string().max(100).optional().nullable(),
  status: z.enum(["waiting", "started", "ended"]).optional(),
  syncGoogleCalendar: z.boolean().optional(),
  inviteClient: z.boolean().optional(),
  participantUserIds: z.array(z.string()).optional(),
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
    project: m.project ? { id: m.project.id, name: m.project.name, projectId: m.project.projectId } : null,
    projectId: m.projectId,
    projectDisplayId: m.project?.projectId ?? m.projectId,
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

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const meeting = await prisma.zoomMeeting.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, projectId: true } },
        createdBy: { select: { id: true, name: true, email: true, image: true } },
        participants: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      },
    });

    if (!meeting) {
      return NextResponse.json(
        { success: false, message: "Meeting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: mapMeeting(meeting) });
  } catch (err) {
    console.error("[GET /api/zoom/[id]]", err);
    return NextResponse.json(
      { success: false, message: "Failed to load meeting" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const rawBody = await request.json();
    const validation = updateSchema.safeParse(rawBody);

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

    const existing = await prisma.zoomMeeting.findUnique({
      where: { id },
      include: { participants: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Meeting not found" },
        { status: 404 }
      );
    }

    const data = validation.data;

    let resolvedProjectId: string | null | undefined = data.projectId;
    if (data.projectId !== undefined && data.projectId !== null) {
      const project = await prisma.project.findFirst({
        where: { OR: [{ id: data.projectId }, { projectId: data.projectId }] },
      });
      if (!project) {
        return NextResponse.json(
          { success: false, message: "Project not found" },
          { status: 400 }
        );
      }
      resolvedProjectId = project.id;
    }

    if (data.participantUserIds !== undefined) {
      const creatorId = existing.createdById;
      const uniqueUserIds = [...new Set([creatorId, ...data.participantUserIds])];
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
      await prisma.zoomMeetingParticipant.deleteMany({ where: { zoomMeetingId: id } });
      await prisma.zoomMeetingParticipant.createMany({
        data: uniqueUserIds.map((userId) => ({ zoomMeetingId: id, userId })),
      });
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (resolvedProjectId !== undefined) updatePayload.projectId = resolvedProjectId;
    if (data.startAt !== undefined) updatePayload.startAt = new Date(data.startAt);
    if (data.durationMinutes !== undefined) updatePayload.durationMinutes = data.durationMinutes;
    if (data.password !== undefined) updatePayload.password = data.password;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.syncGoogleCalendar !== undefined) updatePayload.syncGoogleCalendar = data.syncGoogleCalendar;
    if (data.inviteClient !== undefined) updatePayload.inviteClient = data.inviteClient;

    const meeting = await prisma.zoomMeeting.update({
      where: { id },
      data: updatePayload,
      include: {
        project: { select: { id: true, name: true, projectId: true } },
        createdBy: { select: { id: true, name: true, email: true, image: true } },
        participants: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      },
    });

    return NextResponse.json({ success: true, data: mapMeeting(meeting) });
  } catch (err) {
    console.error("[PATCH /api/zoom/[id]]", err);
    return NextResponse.json(
      { success: false, message: "Failed to update meeting" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await prisma.zoomMeeting.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Meeting not found" },
        { status: 404 }
      );
    }

    await prisma.zoomMeeting.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Meeting deleted" });
  } catch (err) {
    console.error("[DELETE /api/zoom/[id]]", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete meeting" },
      { status: 500 }
    );
  }
}
