import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

type TimesheetItem = {
  id: string;
  projectId: string;
  project: string;
  task: string;
  date: string;
  time: string;
  user: string;
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
      }
    };

    if (role === "employee" && sessionBranchId) {
      where.project.branchId = sessionBranchId;
    }

    const timesheets = await prisma.timesheet.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        project: true,
        task: true,
      },
    });


    const data: TimesheetItem[] = timesheets.map((t: any) => {
      const hours = Math.floor(t.minutes / 60)
        .toString()
        .padStart(2, "0");
      const minutes = (t.minutes % 60).toString().padStart(2, "0");

      return {
        id: t.id,
        projectId: t.projectId,
        project: t.project?.name ?? "",
        task: t.task?.name ?? "",
        date: t.date.toISOString().slice(0, 10),
        time: `${hours}:${minutes}`,
        user: t.userName,
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
