import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

type TimeTrackerItem = {
  id: string;
  projectId: string;
  project: string;
  task: string;
  title: string;
  startTime: string;
  endTime: string;
  totalTime: string;
};

type TrackerRow = {
  id: string;
  projectId: string;
  name: string;
  startTime: Date;
  endTime: Date | null;
  totalSeconds: number;
  project?: { name?: string } | null;
  task?: { name?: string } | null;
};

function formatTime(date: Date | null): string {
  if (!date) return "00:00:00";
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatDuration(seconds: number): string {
  const s = Math.max(0, seconds);
  const h = Math.floor(s / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((s % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export async function GET(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = prisma as unknown as { timeTracker?: typeof prisma.timeTracker };
    if (!client.timeTracker) {
      return NextResponse.json(
        { success: true, data: [] as TimeTrackerItem[] },
        { status: 200 },
      );
    }

    const { id: userId, role, ownerId, branchId: sessionBranchId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    if (!companyId) {
      return NextResponse.json({ success: true, data: [] });
    }

    const where: any = {
      project: {
        OR: [
          { createdBy: { id: companyId } },
          { createdBy: { ownerId: companyId } }
        ]
      }
    };

    if (role === "employee" && sessionBranchId) {
      where.project.branchId = sessionBranchId;
    }

    const trackers = await client.timeTracker.findMany({
      where,
      orderBy: { startTime: "desc" },
      include: {
        project: true,
        task: true,
      },
    });


    const data: TimeTrackerItem[] = trackers.map((t: TrackerRow) => ({
      id: t.id,
      projectId: t.projectId,
      project: t.project?.name ?? "",
      task: t.task?.name ?? "",
      title: t.name,
      startTime: formatTime(t.startTime),
      endTime: formatTime(t.endTime),
      totalTime: formatDuration(t.totalSeconds),
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    const isTableMissing =
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: string }).code === "P2021";
    if (isTableMissing) {
      return NextResponse.json({ success: true, data: [] as TimeTrackerItem[] }, { status: 200 });
    }
    if (process.env.NODE_ENV === "development") {
      console.error("[time-trackers GET]", err);
    }
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}

