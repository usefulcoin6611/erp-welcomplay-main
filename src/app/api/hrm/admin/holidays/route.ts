import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  date: z.string().min(1),
  description: z.string().optional(),
});

function toRow(h: { id: string; name: string; date: Date; description: string | null }) {
  return {
    id: h.id,
    name: h.name,
    date: h.date.toISOString().split("T")[0],
    description: h.description ?? "",
  };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const items = await prisma.hrmHoliday.findMany({
      orderBy: { date: "asc" },
    });
    return NextResponse.json({ success: true, data: items.map(toRow) });
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch holidays" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const item = await prisma.hrmHoliday.create({
      data: {
        name: parsed.data.name,
        date: new Date(parsed.data.date),
        description: parsed.data.description?.trim() || null,
      },
    });
    return NextResponse.json({ success: true, message: "Holiday created", data: toRow(item) });
  } catch (error) {
    console.error("Error creating holiday:", error);
    return NextResponse.json({ success: false, message: "Failed to create holiday" }, { status: 500 });
  }
}
