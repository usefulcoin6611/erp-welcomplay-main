import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "public/uploads/support";
const STATUSES = ["Open", "On Hold", "Close"] as const;
const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

async function generateTicketCode(): Promise<string> {
  const last = await prisma.supportTicket.findFirst({
    orderBy: { ticketCode: "desc" },
  });
  if (!last) return "TKT-001";
  const match = last.ticketCode.match(/TKT-(\d+)/);
  const num = match ? parseInt(match[1], 10) + 1 : 1;
  return `TKT-${num.toString().padStart(3, "0")}`;
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
        assignUser: { select: { id: true, name: true } },
        _count: { select: { replies: true } },
      },
    });

    const data = tickets.map((t) => ({
      id: t.id,
      ticket_code: t.ticketCode,
      subject: t.subject,
      description: t.description ?? "",
      attachment: t.attachment ?? undefined,
      status: t.status as (typeof STATUSES)[number],
      priority: t.priority as (typeof PRIORITIES)[number],
      end_date: t.endDate ? t.endDate.toISOString().split("T")[0] : null,
      created_at: t.createdAt.toISOString().split("T")[0],
      created_by: {
        id: t.createdBy.id,
        name: t.createdBy.name ?? "Unknown",
        avatar: t.createdBy.image ?? undefined,
      },
      assign_user: t.assignUser?.name ?? undefined,
      assign_user_id: t.assignUserId ?? undefined,
      reply_count: t._count.replies,
      has_unread_reply: false, // can be extended with read flags
    }));

    return NextResponse.json({ success: true, data });
  } catch (e) {
    console.error("Support GET:", e);
    return NextResponse.json(
      { success: false, message: "Failed to load support tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const contentType = request.headers.get("content-type") ?? "";
    let subject: string;
    let assignUserId: string | null = null;
    let priority: string = "Medium";
    let status: string = "Open";
    let end_date: string | null = null;
    let description: string | null = null;
    let attachmentPath: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      subject = String(formData.get("subject") ?? "").trim();
      const assignUser = formData.get("user") as string | null;
      if (assignUser && assignUser.trim()) assignUserId = assignUser.trim();
      priority = String(formData.get("priority") ?? "Medium").trim();
      status = String(formData.get("status") ?? "Open").trim();
      const endDateVal = formData.get("end_date") as string | null;
      end_date = endDateVal && endDateVal.trim() ? endDateVal.trim() : null;
      description = (formData.get("description") as string | null)?.trim() ?? null;

      const file = formData.get("attachment") as File | null;
      if (file && file.size > 0) {
        const uploadDir = path.join(process.cwd(), UPLOAD_DIR);
        await mkdir(uploadDir, { recursive: true });
        const safeName = file.name.replace(/\s+/g, "_");
        const filename = `${Date.now()}_${safeName}`;
        const filepath = path.join(uploadDir, filename);
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filepath, buffer);
        attachmentPath = `/uploads/support/${filename}`;
      }
    } else {
      const body = await request.json();
      subject = String(body.subject ?? "").trim();
      if (body.user) assignUserId = body.user;
      if (body.priority) priority = body.priority;
      if (body.status) status = body.status;
      if (body.end_date) end_date = body.end_date;
      if (body.description != null) description = body.description;
      if (body.attachment) attachmentPath = body.attachment;
    }

    if (!subject) {
      return NextResponse.json(
        { success: false, message: "Subject is required" },
        { status: 400 }
      );
    }

    const ticketCode = await generateTicketCode();
    const endDateObj = end_date ? new Date(`${end_date}T00:00:00.000Z`) : null;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketCode,
        subject,
        description,
        attachment: attachmentPath,
        status: status in STATUSES ? status : "Open",
        priority: priority in PRIORITIES ? priority : "Medium",
        endDate: endDateObj,
        createdById: userId,
        assignUserId,
      },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
        assignUser: { select: { id: true, name: true } },
        _count: { select: { replies: true } },
      },
    });

    const data = {
      id: ticket.id,
      ticket_code: ticket.ticketCode,
      subject: ticket.subject,
      description: ticket.description ?? "",
      attachment: ticket.attachment ?? undefined,
      status: ticket.status,
      priority: ticket.priority,
      end_date: ticket.endDate ? ticket.endDate.toISOString().split("T")[0] : null,
      created_at: ticket.createdAt.toISOString().split("T")[0],
      created_by: {
        id: ticket.createdBy.id,
        name: ticket.createdBy.name ?? "Unknown",
        avatar: ticket.createdBy.image ?? undefined,
      },
      assign_user: ticket.assignUser?.name ?? undefined,
      assign_user_id: ticket.assignUserId ?? undefined,
      reply_count: ticket._count.replies,
      has_unread_reply: false,
    };

    return NextResponse.json({
      success: true,
      message: "Support ticket created",
      data,
    });
  } catch (e) {
    console.error("Support POST:", e);
    return NextResponse.json(
      { success: false, message: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}
