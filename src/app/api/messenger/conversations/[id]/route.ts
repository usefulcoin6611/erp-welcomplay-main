import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-server'
import { headers } from 'next/headers'

/**
 * GET /api/messenger/conversations/[id]
 * Get a single conversation with other participant (for opening from list or after create).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const currentUserId = (session.user as { id?: string }).id
    if (!currentUserId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params

    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: currentUserId },
      include: {
        conversation: {
          include: {
            participants: {
              where: { userId: { not: currentUserId } },
              include: { user: { select: { id: true, name: true, email: true, image: true } } },
            },
          },
        },
      },
    })

    if (!participant) {
      return NextResponse.json({ success: false, message: 'Conversation not found' }, { status: 404 })
    }

    const conv = participant.conversation
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
  } catch (error) {
    console.error('Messenger conversation get API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}
