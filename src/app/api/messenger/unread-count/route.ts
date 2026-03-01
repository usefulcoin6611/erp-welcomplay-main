import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-server'
import { headers } from 'next/headers'

/**
 * GET /api/messenger/unread-count
 * Returns the number of conversations with unread messages for the current user.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false, count: 0 }, { status: 401 })
    }

    const currentUserId = (session.user as { id?: string }).id
    if (!currentUserId) {
      return NextResponse.json({ success: false, count: 0 }, { status: 401 })
    }

    const participants = await prisma.conversationParticipant.findMany({
      where: { userId: currentUserId },
      include: {
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    let count = 0
    for (const p of participants) {
      const lastMsg = p.conversation.messages[0]
      if (!lastMsg) continue
      const lastMsgFromOther = lastMsg.senderId !== currentUserId
      const hasUnread =
        lastMsgFromOther &&
        (p.lastSeenAt == null || new Date(lastMsg.createdAt) > p.lastSeenAt)
      if (hasUnread) count++
    }

    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error('[messenger unread-count]', error)
    return NextResponse.json({ success: false, count: 0 }, { status: 500 })
  }
}
