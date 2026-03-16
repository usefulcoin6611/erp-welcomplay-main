import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

type BugDetail = {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  bugStatus: string;
  priority: string;
  dueDate: string;
  createdDate: string;
  createdBy: string;
  assignTo: string[];
  description: string;
  attachments: number;
  comments: number;
  commentList: { user: string; text: string; time: string }[];
  files: { id: string; name: string; size: string }[];
};

function mapBug(b: any): BugDetail {
  const createdDate =
    b.createdAt instanceof Date ? b.createdAt.toISOString().slice(0, 10) : "";
  const dueDate =
    b.dueDate instanceof Date
      ? b.dueDate.toISOString().slice(0, 10)
      : b.startDate instanceof Date
        ? b.startDate.toISOString().slice(0, 10)
        : "";

  const assigned =
    Array.isArray(b.assignedTo) && b.assignedTo.length > 0
      ? (b.assignedTo as string[])
      : [];

  return {
    id: String(b.id),
    projectId: String(b.projectId ?? ""),
    projectName: String(b.project?.name ?? ""),
    title: String(b.title ?? ""),
    bugStatus: String(b.status?.title ?? ""),
    priority: String(b.priority ?? ""),
    dueDate,
    createdDate,
    createdBy: String(b.createdBy ?? "System"),
    assignTo: assigned,
    description: String(b.description ?? ""),
    attachments: typeof b.attachments === "number" ? b.attachments : 0,
    comments: typeof b.comments === "number" ? b.comments : 0,
    commentList: [],
    files: [],
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

    const bug = await prisma.bug.findFirst({
      where,
      include: {
        project: true,
        status: true,
      },
    });

    if (!bug) {
      return NextResponse.json(
        { success: false, message: "Bug tidak ditemukan atau akses ditolak" },
        { status: 404 },
      );
    }


    const data = mapBug(bug);

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}

