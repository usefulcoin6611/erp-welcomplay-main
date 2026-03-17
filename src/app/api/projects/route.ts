import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const projectSchema = z.object({
  name: z.string().min(1, "Nama project wajib diisi"),
  clientName: z.string().optional().nullable(),
  status: z
    .enum(["not_started", "on_hold", "in_progress", "cancel", "finished"])
    .default("not_started"),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  budget: z.number().nonnegative().optional().default(0),
  estimatedHrs: z.number().nonnegative().optional().default(0),
  description: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
  users: z.array(z.string()).optional().default([]),
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

export async function GET(request: NextRequest) {
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

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.trim() || "";

    const projects = await (prisma.project as any).findMany({
      orderBy: { createdAt: "desc" },
    }) as any[];

    const userBranches = await (prisma as any).branch.findMany({
      where: { ownerId: companyId },
      select: { id: true }
    })
    const branchIds = userBranches.map((b: any) => b.id)

    let filteredProjects = projects.filter((p: any) => branchIds.includes(p.branchId));

    if (role === "employee" && sessionBranchId) {
      filteredProjects = filteredProjects.filter((p: any) => p.branchId === sessionBranchId);
    }

    if (status && status !== "all") {
      filteredProjects = filteredProjects.filter((p: any) => p.status === status);
    }

    if (search) {
      filteredProjects = filteredProjects.filter((p: any) => 
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const data = filteredProjects.map(mapProject);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role === "client") {
      return NextResponse.json(
        { success: false, message: "Client role cannot create projects." },
        { status: 403 }
      );
    }

    const { id: userId, branchId: sessionBranchId } = session.user as any;
    const branchId = sessionBranchId || null;

    const rawBody = await request.json();
    const validation = projectSchema.safeParse(rawBody);

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
    } = validation.data;

    const lastProject = await prisma.project.findFirst({
      where: branchId ? { branchId } : {},
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 1;
    if (lastProject?.projectId) {
      const match = lastProject.projectId.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const projectId = `PRJ-${String(nextNumber).padStart(3, "0")}`;

    const created = await prisma.project.create({
      data: {
        projectId,
        branchId,
        name,
        clientName: clientName ?? null,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ?? 0,
        estimatedHrs: estimatedHrs ?? 0,
        progress: 0,
        description: description ?? null,
        tags: tags ?? null,
        users: users ?? [],
        createdById: userId ?? null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: mapProject(created),
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

