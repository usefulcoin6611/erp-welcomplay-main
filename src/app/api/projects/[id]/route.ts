import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1, "Nama project wajib diisi").optional(),
  clientName: z.string().optional().nullable(),
  status: z
    .enum(["not_started", "on_hold", "in_progress", "cancel", "finished"])
    .optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  budget: z.number().nonnegative().optional(),
  estimatedHrs: z.number().nonnegative().optional(),
  description: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  users: z.array(z.string()).optional(),
  progress: z.number().min(0).max(100).optional(),
});

function mapProject(p: any) {
  return {
    id: p.projectId as string,
    name: p.name as string,
    clientName: (p.clientName as string | null) ?? "",
    status: p.status as string,
    startDate: p.startDate ? (p.startDate as Date).toISOString().slice(0, 10) : "",
    endDate: p.endDate ? (p.endDate as Date).toISOString().slice(0, 10) : "",
    budget: Number(p.budget) || 0,
    estimatedHrs: Number(p.estimatedHrs) || 0,
    completion: Number(p.progress) || 0,
    description: (p.description as string | null) ?? "",
    tags: (p.tags as string | null) ?? "",
    users: Array.isArray(p.users) ? (p.users as string[]) : [],
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

    const { id } = await props.params;

    const project = await prisma.project.findFirst({
      where: {
        projectId: id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: mapProject(project) });
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;

    const rawBody = await request.json();
    const validation = updateSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0].message,
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const {
      name,
      clientName,
      status,
      startDate,
      endDate,
      budget,
      estimatedHrs,
      description,
      tags,
      users,
      progress,
    } = validation.data;

    const existing = await prisma.project.findFirst({
      where: { projectId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Project tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await prisma.project.update({
      where: { id: existing.id },
      data: {
        name: name ?? existing.name,
        clientName: clientName ?? existing.clientName,
        status: status ?? existing.status,
        startDate:
          startDate !== undefined
            ? startDate
              ? new Date(startDate)
              : null
            : existing.startDate,
        endDate:
          endDate !== undefined
            ? endDate
              ? new Date(endDate)
              : null
            : existing.endDate,
        budget: budget ?? existing.budget,
        estimatedHrs: estimatedHrs ?? existing.estimatedHrs,
        description: description ?? existing.description,
        tags: tags ?? existing.tags,
        users: users ?? existing.users,
        progress:
          progress !== undefined ? Math.min(Math.max(progress, 0), 100) : existing.progress,
      },
    });

    return NextResponse.json({ success: true, data: mapProject(updated) });
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, props: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await props.params;

    const existing = await prisma.project.findFirst({
      where: { projectId: id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Project tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

