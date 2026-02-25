import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  branch: z.string().trim().min(1),
  department: z.string().trim().min(1),
  designation: z.string().trim().min(1),
  technicalRating: z.coerce.number().min(0).max(5),
  organizationalRating: z.coerce.number().min(0).max(5),
  customerExperienceRating: z.coerce.number().min(0).max(5),
  addedBy: z.string().trim().optional().default(""),
});

function toResponse(ind: { id: string; branch: string; department: string; designation: string; overallRating: number; addedBy: string; createdAt: Date }) {
  return { id: ind.id, branch: ind.branch, department: ind.department, designation: ind.designation, overallRating: ind.overallRating, addedBy: ind.addedBy, createdAt: ind.createdAt.toISOString().split("T")[0] };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const list = await prisma.performanceIndicator.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ success: true, data: list.map(toResponse) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal memuat indikator" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string })?.role;
    if (role !== "super admin" && role !== "company") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message ?? "Data tidak valid" }, { status: 400 });
    const { technicalRating, organizationalRating, customerExperienceRating, ...rest } = parsed.data;
    const overallRating = (technicalRating + organizationalRating + customerExperienceRating) / 3;
    const created = await prisma.performanceIndicator.create({
      data: { ...rest, technicalRating, organizationalRating, customerExperienceRating, overallRating: Math.round(overallRating * 10) / 10 },
    });
    return NextResponse.json({ success: true, message: "Indikator berhasil dibuat", data: toResponse(created) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, message: "Gagal membuat indikator" }, { status: 500 });
  }
}
