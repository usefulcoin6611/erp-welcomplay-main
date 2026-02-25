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

    const trackers = await prisma.timeTracker.findMany({
      orderBy: { startTime: "desc" },
      include: {
        project: true,
        task: true,
      },
    });

    const data: TimeTrackerItem[] = trackers.map((t) => ({
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
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}

