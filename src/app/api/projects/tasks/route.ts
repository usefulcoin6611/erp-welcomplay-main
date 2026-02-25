import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

type TaskItem = {
  id: string;
  name: string;
  projectName: string;
  projectId: string;
  stage: string;
  priority: string;
  endDate: string;
  assignedTo: string[];
  completion: number;
  attachments: number;
  comments: number;
  checklists: number;
  isOwner: boolean;
};

export async function GET(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.projectTask.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        project: true,
      },
    });

    const data: TaskItem[] = tasks.map((t: any) => {
      const endDate =
        t.endDate ?? t.startDate ?? t.project?.endDate ?? t.project?.startDate ?? new Date();

      return {
        id: t.id,
        name: t.name,
        projectName: t.project?.name ?? "",
        projectId: t.projectId,
        stage: t.stage,
        priority: t.priority,
        endDate: endDate.toISOString().slice(0, 10),
        assignedTo: Array.isArray(t.assignedTo) ? (t.assignedTo as string[]) : [],
        completion: t.completion ?? 0,
        attachments: t.attachments ?? 0,
        comments: t.comments ?? 0,
        checklists: t.checklists ?? 0,
        isOwner: t.isOwner ?? false,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}
