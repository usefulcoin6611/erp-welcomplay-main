import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

type TaskDetail = {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  stage: string;
  priority: string;
  startDate: string;
  endDate: string;
  estimatedHrs: number | null;
  milestone: string | null;
  progress: number;
  description: string;
  assignedTo: string[];
  attachments: number;
  comments: number;
  checklists: { id: string; name: string; done: boolean }[];
  files: { id: string; name: string; size: string }[];
  activity: { user: string; type: string; remark: string; time: string }[];
  commentList: { user: string; text: string; time: string }[];
};

function mapTask(t: any): TaskDetail {
  const startDate =
    t.startDate instanceof Date ? t.startDate.toISOString().slice(0, 10) : "";
  const endDate =
    t.endDate instanceof Date ? t.endDate.toISOString().slice(0, 10) : "";

  return {
    id: String(t.id),
    name: String(t.name ?? ""),
    projectId: String(t.projectId ?? ""),
    projectName: String(t.project?.name ?? ""),
    stage: String(t.stage ?? ""),
    priority: String(t.priority ?? ""),
    startDate,
    endDate,
    estimatedHrs:
      typeof t.estimatedHrs === "number" ? Number(t.estimatedHrs) : null,
    milestone: null,
    progress: typeof t.completion === "number" ? t.completion : 0,
    description: String(t.description ?? ""),
    assignedTo: Array.isArray(t.assignedTo)
      ? (t.assignedTo as string[])
      : [],
    attachments: typeof t.attachments === "number" ? t.attachments : 0,
    comments: typeof t.comments === "number" ? t.comments : 0,
    checklists: [],
    files: [],
    activity: [],
    commentList: [],
  };
}

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId, role, ownerId, branchId: sessionBranchId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;
    if (!companyId) return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });

    const { id } = await props.params;

    const where: any = {
      id,
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

    const task = await prisma.projectTask.findFirst({
      where,
      include: {
        project: true,
      },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: "Task tidak ditemukan atau akses ditolak" },
        { status: 404 },
      );
    }


    const data = mapTask(task);

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}

