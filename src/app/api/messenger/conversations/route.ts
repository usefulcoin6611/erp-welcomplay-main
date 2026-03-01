import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-server'
import { headers } from 'next/headers'

/**
 * GET /api/messenger/conversations
 * List conversations for the current user with last message and other participant.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const currentUserId = (session.user as { id?: string }).id
    if (!currentUserId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const participants = await prisma.conversationParticipant.findMany({
      where: { userId: currentUserId },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: currentUserId } },
              include: { user: { select: { id: true, name: true, email: true, image: true } } },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { sender: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    })

    const data = participants.map((p) => {
      const conv = p.conversation
      const other = conv.participants[0]?.user
      const lastMsg = conv.messages[0]
      const lastMsgFromOther = lastMsg && lastMsg.senderId !== currentUserId
      const hasUnread =
        lastMsgFromOther &&
        (p.lastSeenAt == null || new Date(lastMsg.createdAt) > p.lastSeenAt)
      return {
        id: conv.id,
        updatedAt: conv.updatedAt.toISOString(),
        otherUser: other
          ? {
              id: other.id,
              name: other.name ?? other.email,
              email: other.email,
              image: other.image ?? null,
            }
          : null,
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              content: lastMsg.content,
              createdAt: lastMsg.createdAt.toISOString(),
              senderId: lastMsg.senderId,
              senderName: lastMsg.sender.name ?? lastMsg.sender.id,
            }
          : null,
        hasUnread: !!hasUnread,
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Messenger conversations list API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/messenger/conversations
 * Create a new 1:1 conversation or return existing one.
 * Body: { otherUserId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const currentUserId = (session.user as { id?: string }).id
    if (!currentUserId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const otherUserId = typeof body.otherUserId === 'string' ? body.otherUserId.trim() : null
    if (!otherUserId || otherUserId === currentUserId) {
      return NextResponse.json(
        { success: false, message: 'Invalid otherUserId' },
        { status: 400 }
      )
    }

    const myConvoIds = await prisma.conversationParticipant
      .findMany({ where: { userId: currentUserId }, select: { conversationId: true } })
      .then((rows) => rows.map((r) => r.conversationId))

    const existingParticipant = await prisma.conversationParticipant.findFirst({
      where: {
        userId: otherUserId,
        conversationId: { in: myConvoIds },
      },
    })

    const existing = existingParticipant
      ? await prisma.conversation.findUnique({
          where: { id: existingParticipant.conversationId },
          include: {
            participants: {
              where: { userId: { not: currentUserId } },
              include: { user: { select: { id: true, name: true, email: true, image: true } } },
            },
          },
        })
      : null

    if (existing) {
      const conv = existing
      const other = conv.participants[0]?.user
      return NextResponse.json({
        success: true,
        data: {
          id: conv.id,
          updatedAt: conv.updatedAt.toISOString(),
          otherUser: other
            ? {
                id: other.id,
                name: other.name ?? other.email,
                email: other.email,
                image: other.image ?? null,
              }
            : null,
        },
      })
    }

    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId, isActive: true },
      select: { id: true, name: true, email: true, image: true },
    })
    if (!otherUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: currentUserId },
            { userId: otherUserId },
          ],
        },
      },
      include: {
        participants: {
          where: { userId: { not: currentUserId } },
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
        },
      },
    })

    const other = conversation.participants[0]?.user
    return NextResponse.json({
      success: true,
      data: {
        id: conversation.id,
        updatedAt: conversation.updatedAt.toISOString(),
        otherUser: other
          ? {
              id: other.id,
              name: other.name ?? other.email,
              email: other.email,
              image: other.image ?? null,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Messenger create conversation API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
