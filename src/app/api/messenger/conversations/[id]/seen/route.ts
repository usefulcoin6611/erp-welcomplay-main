import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-server'
import { headers } from 'next/headers'

/**
 * PATCH /api/messenger/conversations/[id]/seen
 * Mark conversation as seen up to a message. Body: { lastSeenMessageId: string }
 */
export async function PATCH(
  request: NextRequest,
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
    const body = await request.json().catch(() => ({}))
    const lastSeenMessageId = typeof body.lastSeenMessageId === 'string' ? body.lastSeenMessageId.trim() : null

    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: currentUserId },
    })
    if (!participant) {
      return NextResponse.json({ success: false, message: 'Conversation not found' }, { status: 404 })
    }

    let lastSeenAt: Date | null = null
    if (lastSeenMessageId) {
      const msg = await prisma.message.findFirst({
        where: { id: lastSeenMessageId, conversationId },
        select: { createdAt: true },
      })
      if (msg) lastSeenAt = msg.createdAt
    }

    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { lastSeenMessageId: lastSeenMessageId || null, lastSeenAt },
    })

    return NextResponse.json({
      success: true,
      data: { lastSeenMessageId, lastSeenAt: lastSeenAt?.toISOString() ?? null },
    })
  } catch (error) {
    console.error('Messenger seen API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update seen' },
      { status: 500 }
    )
  }
}
