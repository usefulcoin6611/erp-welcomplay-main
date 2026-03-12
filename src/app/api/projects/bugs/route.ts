import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

type BugItem = {
  id: string;
  title: string;
  projectName: string;
  projectId: string;
  bugStatus: string;
  priority: string;
  dueDate: string;
  createdBy: string;
  assignedTo: string[];
  attachments: number;
  comments: number;
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

    const bugs = await prisma.bug.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        project: true,
        status: true,
      },
    });

    const data: BugItem[] = bugs.map((b: any, index: number) => ({
      id: b.id,
      title: b.title,
      projectName: b.project?.name ?? "",
      projectId: b.projectId,
      bugStatus: b.status?.title ?? "",
      priority: b.priority,
      dueDate: (b.dueDate ?? b.startDate ?? new Date())
        .toISOString()
        .slice(0, 10),
      createdBy: b.createdBy ?? "System",
      assignedTo: Array.isArray(b.assignedTo) ? (b.assignedTo as string[]) : [],
      attachments: b.attachments ?? 0,
      comments: b.comments ?? 0,
      isOwner: index % 2 === 0,
    }));

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}
