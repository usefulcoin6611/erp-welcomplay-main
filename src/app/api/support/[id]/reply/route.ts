import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: supportTicketId } = await params;
    const body = await request.json();
    const message = String(body.message ?? "").trim();

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message is required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: supportTicketId },
    });
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 }
      );
    }

    const reply = await prisma.supportReply.create({
      data: {
        supportTicketId,
        userId: session.user.id as string,
        message,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reply sent",
      data: {
        id: reply.id,
        message: reply.message,
        created_at: reply.createdAt.toISOString(),
        user: reply.user,
      },
    });
  } catch (e) {
    console.error("Support reply POST:", e);
    return NextResponse.json(
      { success: false, message: "Failed to send reply" },
      { status: 500 }
    );
  }
}
