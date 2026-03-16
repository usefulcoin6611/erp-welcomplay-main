import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const UPLOAD_DIR = "public/uploads/support";
const STATUSES = ["Open", "On Hold", "Close"] as const;
const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

function mapTicket(t: any) {
  return {
    id: t.id,
    ticket_code: t.ticketCode,
    subject: t.subject,
    description: t.description ?? "",
    attachment: t.attachment ?? undefined,
    status: t.status,
    priority: t.priority,
    end_date: t.endDate ? t.endDate.toISOString().split("T")[0] : null,
    created_at: t.createdAt.toISOString().split("T")[0],
    created_by: {
      id: t.createdBy.id,
      name: t.createdBy.name ?? "Unknown",
      avatar: t.createdBy.image ?? undefined,
    },
    assign_user: t.assignUser?.name ?? undefined,
    assign_user_id: t.assignUserId ?? undefined,
    reply_count: t._count?.replies ?? 0,
    has_unread_reply: false,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { id: sessionUserId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? sessionUserId : ownerId;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, image: true, ownerId: true } },
        assignUser: { select: { id: true, name: true } },
        _count: { select: { replies: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    const creator = ticket.createdBy;
    const creatorCompanyId = creator.ownerId || creator.id;
    if (creatorCompanyId !== companyId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mapTicket(ticket),
    });
  } catch (e) {
    console.error("Support GET [id]:", e);
    return NextResponse.json(
      { success: false, message: "Failed to load ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { id: sessionUserId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? sessionUserId : ownerId;

    const existing = await prisma.supportTicket.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, ownerId: true } } }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    const creator = existing.createdBy;
    const creatorCompanyId = creator.ownerId || creator.id;
    if (creatorCompanyId !== companyId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const status = body.status as string | undefined;

    if (!status || !(STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: { status },
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
        assignUser: { select: { id: true, name: true } },
        _count: { select: { replies: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Status updated",
      data: mapTicket(ticket),
    });
  } catch (e) {
    console.error("Support PATCH [id]:", e);
    return NextResponse.json(
      { success: false, message: "Failed to update status" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { id: sessionUserId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? sessionUserId : ownerId;

    const existing = await prisma.supportTicket.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, ownerId: true } } }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    const creator = existing.createdBy;
    const creatorCompanyId = creator.ownerId || creator.id;
    if (creatorCompanyId !== companyId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 404 }
      );
    }

    const contentType = request.headers.get("content-type") ?? "";

    let subject: string | undefined;
    let assignUserId: string | null | undefined;
    let priority: string | undefined;
    let status: string | undefined;
    let end_date: string | null | undefined;
    let description: string | null | undefined;
    let attachmentPath: string | null | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const sub = formData.get("subject") as string | null;
      if (sub != null) subject = sub.trim();
      const user = formData.get("user") as string | null;
      if (user !== undefined) assignUserId = user?.trim() || null;
      const pri = formData.get("priority") as string | null;
      if (pri != null) priority = pri.trim();
      const st = formData.get("status") as string | null;
      if (st != null) status = st.trim();
      const end = formData.get("end_date") as string | null;
      if (end !== undefined) end_date = end?.trim() || null;
      const desc = formData.get("description") as string | null;
      if (desc !== undefined) description = desc?.trim() || null;

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
      subject = body.subject;
      assignUserId = body.user !== undefined ? body.user : undefined;
      priority = body.priority;
      status = body.status;
      end_date = body.end_date;
      description = body.description;
      attachmentPath = body.attachment;
    }

    if (assignUserId) {
      const userExists = await prisma.user.findFirst({
        where: {
          id: assignUserId,
          OR: [
            { id: companyId },
            { ownerId: companyId }
          ]
        }
      });
      if (!userExists) {
        return NextResponse.json(
          { success: false, message: "Invalid assigned user" },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (subject !== undefined) updateData.subject = subject;
    if (assignUserId !== undefined) updateData.assignUserId = assignUserId;
    if (priority !== undefined) updateData.priority = priority in PRIORITIES ? priority : undefined;
    if (status !== undefined) updateData.status = status in STATUSES ? status : undefined;
    if (end_date !== undefined) updateData.endDate = end_date ? new Date(`${end_date}T00:00:00.000Z`) : null;
    if (description !== undefined) updateData.description = description;
    if (attachmentPath !== undefined) updateData.attachment = attachmentPath;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true, image: true } },
        assignUser: { select: { id: true, name: true } },
        _count: { select: { replies: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ticket updated",
      data: mapTicket(ticket),
    });
  } catch (e) {
    console.error("Support PUT [id]:", e);
    return NextResponse.json(
      { success: false, message: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { id: sessionUserId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? sessionUserId : ownerId;

    const existing = await prisma.supportTicket.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, ownerId: true } } }
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    const creator = existing.createdBy;
    const creatorCompanyId = creator.ownerId || creator.id;
    if (creatorCompanyId !== companyId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 404 }
      );
    }

    await prisma.supportTicket.delete({ where: { id } });
    return NextResponse.json({
      success: true,
      message: "Ticket deleted",
    });
  } catch (e) {
    console.error("Support DELETE [id]:", e);
    return NextResponse.json(
      { success: false, message: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
