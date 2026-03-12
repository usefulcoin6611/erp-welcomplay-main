import type { PrismaClient } from "@prisma/client";

export async function seedZoomMeetings(prisma: PrismaClient | any) {
  const zoomMeetingCount = await prisma.zoomMeeting.count().catch(() => 0);
  if (zoomMeetingCount > 0) {
    return;
  }

  const users = await prisma.user.findMany({
    where: { role: { in: ["super admin", "company", "employee"] }, isActive: true },
    select: { id: true },
    take: 6,
  });

  const projects = await prisma.project.findMany({
    select: { id: true, name: true },
    take: 4,
  });

  if (users.length < 2) {
    return;
  }

  const now = new Date();
  const baseMeetings = [
    {
      title: "Weekly Team Sync",
      projectIndex: 0,
      startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0),
      durationMinutes: 60,
      status: "waiting" as const,
      participantIndices: [0, 1],
    },
    {
      title: "Project Review Meeting",
      projectIndex: 1,
      startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 14, 30, 0),
      durationMinutes: 90,
      status: "started" as const,
      participantIndices: [1, 2],
    },
    {
      title: "Client Presentation",
      projectIndex: 2,
      startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 9, 0, 0),
      durationMinutes: 45,
      status: "ended" as const,
      participantIndices: [2],
    },
    {
      title: "Sprint Planning",
      projectIndex: 0,
      startAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0),
      durationMinutes: 120,
      status: "waiting" as const,
      participantIndices: [0, 1, 2],
    },
  ];

  for (const m of baseMeetings) {
    const project = projects[m.projectIndex] ?? null;
    const creator = users[0];
    const participantUserIds = m.participantIndices.map((i) => users[i]?.id).filter(Boolean);
    const allUserIds = [...new Set([creator.id, ...participantUserIds])];

    await prisma.zoomMeeting.create({
      data: {
        title: m.title,
        projectId: project?.id ?? null,
        startAt: m.startAt,
        durationMinutes: m.durationMinutes,
        status: m.status,
        createdById: creator.id,
        syncGoogleCalendar: false,
        inviteClient: true,
        joinUrl: "https://zoom.us/j/" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        startUrl: "https://zoom.us/s/" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        participants: {
          create: allUserIds.map((userId) => ({ userId })),
        },
      },
    });
  }
}
