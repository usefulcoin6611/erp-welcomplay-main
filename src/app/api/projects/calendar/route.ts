import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

type CalendarTask = {
  id: string;
  title: string;
  start: string;
  end: string;
  projectId: string;
  projectName: string;
};

export async function GET(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      },
      OR: [{ startDate: { not: null } }, { endDate: { not: null } }],
    };

    if (role === "employee" && sessionBranchId) {
      where.project.branchId = sessionBranchId;
    }

    const tasks = await prisma.projectTask.findMany({
      where,
      orderBy: { startDate: "asc" },
      include: {
        project: true,
      },
    });


    const data: CalendarTask[] = tasks.map((t: any) => {

      const start =
        t.startDate ?? t.endDate ?? t.project?.startDate ?? new Date();
      const end =
        t.endDate ?? t.startDate ?? t.project?.endDate ?? start;

      return {
        id: t.id,
        title: t.name,
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        projectId: t.projectId,
        projectName: t.project?.name ?? "",
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

