import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-server'
import { headers } from 'next/headers'

/**
 * GET /api/messenger/conversations/[id]/messages
 * List messages for a conversation. Query: limit (default 50), cursor (message id for older)
 */
export async function GET(
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
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
    const cursor = searchParams.get('cursor') ?? undefined

    const [isParticipant, otherParticipant] = await Promise.all([
      prisma.conversationParticipant.findFirst({
        where: { conversationId, userId: currentUserId },
      }),
      prisma.conversationParticipant.findFirst({
        where: { conversationId, userId: { not: currentUserId } },
        select: { lastSeenAt: true, lastSeenMessageId: true },
      }),
    ])
    if (!isParticipant) {
      return NextResponse.json({ success: false, message: 'Conversation not found' }, { status: 404 })
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true } },
        attachments: { select: { id: true, fileUrl: true, fileName: true, mimeType: true, fileSize: true } },
      },
    })

    const hasMore = messages.length > limit
    const list = hasMore ? messages.slice(0, limit) : messages

    const data = list.map((m: any) => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      senderId: m.senderId,
      sender: {
        id: m.sender.id,
        name: m.sender.name ?? m.sender.email,
        email: m.sender.email,
        image: m.sender.image ?? null,
      },
      attachments: m.attachments.map((a: any) => ({
        id: a.id,
        fileUrl: a.fileUrl,
        fileName: a.fileName,
        mimeType: a.mimeType ?? null,
        fileSize: a.fileSize ?? null,
      })),
    })).reverse()

    return NextResponse.json({
      success: true,
      data,
      nextCursor: hasMore ? list[list.length - 1].id : null,
      otherLastSeenAt: otherParticipant?.lastSeenAt?.toISOString() ?? null,
      otherLastSeenMessageId: otherParticipant?.lastSeenMessageId ?? null,
    })
  } catch (error) {
    console.error('Messenger messages list API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

const UPLOAD_DIR = 'public/uploads/messenger'
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv', 'application/zip',
]

/**
 * POST /api/messenger/conversations/[id]/messages
 * Send a message. Body: JSON { content: string } or FormData { content: string, files: File[] }
 */
export async function POST(
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

    const contentType = request.headers.get('content-type') ?? ''
    let content = ''
    const attachmentFiles: { buffer: Buffer; name: string; mimeType: string; size: number }[] = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      content = (formData.get('content') as string | null)?.trim() ?? ''
      const files = formData.getAll('files') as File[]
      for (const file of files) {
        if (!file?.size || !file?.name) continue
        if (file.size > MAX_FILE_SIZE) continue
        const mimeType = file.type || 'application/octet-stream'
        if (ALLOWED_TYPES.length && !ALLOWED_TYPES.includes(mimeType) && !mimeType.startsWith('image/')) {
          // allow any image/* if not in list
          if (!mimeType.startsWith('image/')) continue
        }
        const buffer = Buffer.from(await file.arrayBuffer())
        attachmentFiles.push({ buffer, name: file.name, mimeType, size: file.size })
      }
    } else {
      const body = await request.json().catch(() => ({}))
      content = typeof body.content === 'string' ? body.content.trim() : ''
    }

    if (!content && attachmentFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Content or at least one attachment is required' },
        { status: 400 }
      )
    }

    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId, userId: currentUserId },
    })
    if (!isParticipant) {
      return NextResponse.json({ success: false, message: 'Conversation not found' }, { status: 404 })
    }

    const ts = Date.now()
    const { put } = await import('@vercel/blob')

    // Upload files to Vercel Blob first
    const attachmentMeta = await Promise.all(
      attachmentFiles.map(async (f, i) => {
        const safeName = f.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '')
        const filename = `${ts}_${i}_${safeName}`
        const blobPath = `messenger/${filename}`
        let fileUrl = '/placeholder.svg'

        try {
          if (!process.env.BLOB_READ_WRITE_TOKEN) {
            throw new Error("Missing BLOB_READ_WRITE_TOKEN");
          }
          const blob = await put(blobPath, f.buffer, {
            access: 'public',
            contentType: f.mimeType || 'application/octet-stream',
          })
          fileUrl = blob.url
        } catch (error) {
          console.warn('Vercel Blob upload failed, falling back to local file system:', error instanceof Error ? error.message : error)

          try {
            const fs = await import('fs/promises')
            const path = await import('path')

            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'messenger')
            await fs.mkdir(uploadDir, { recursive: true }).catch(() => { })

            const localFilePath = path.join(uploadDir, filename)
            await fs.writeFile(localFilePath, f.buffer)

            fileUrl = `/uploads/messenger/${filename}`
          } catch (fsError) {
            console.error('Local fallback also failed:', fsError)
          }
        }

        return { fileUrl, fileName: f.name, mimeType: f.mimeType, fileSize: f.size }
      })
    )

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: currentUserId,
          content: content || '',
          attachments: {
            create: attachmentMeta.map(({ fileUrl, fileName, mimeType, fileSize }) => ({ fileUrl, fileName, mimeType, fileSize })),
          },
        },
        include: {
          sender: { select: { id: true, name: true, email: true, image: true } },
          attachments: { select: { id: true, fileUrl: true, fileName: true, mimeType: true, fileSize: true } },
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        senderId: message.senderId,
        sender: {
          id: message.sender.id,
          name: message.sender.name ?? message.sender.email,
          email: message.sender.email,
          image: message.sender.image ?? null,
        },
        attachments: message.attachments.map((a: any) => ({
          id: a.id,
          fileUrl: a.fileUrl,
          fileName: a.fileName,
          mimeType: a.mimeType ?? null,
          fileSize: a.fileSize ?? null,
        })),
      },
    })
  } catch (error) {
    console.error('Messenger send message API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    )
  }
}
