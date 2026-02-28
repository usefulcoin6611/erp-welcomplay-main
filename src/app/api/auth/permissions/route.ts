import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/auth/permissions
 * Returns the current user's access profile permissions (for menu and route filtering).
 * Used when user has role employee or company and an assigned access profile.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, permissions: [] }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        accessProfileId: true,
        accessProfile: {
          select: { permissions: true, name: true },
        },
      },
    })

    const accessProfileName = user?.accessProfile?.name ?? null

    // No access profile => return null so client shows full role menu (no filtering)
    if (!user?.accessProfile?.permissions) {
      return NextResponse.json({ success: true, permissions: null, accessProfileName })
    }

    const raw = user.accessProfile.permissions
    const parsed = Array.isArray(raw)
      ? (raw as string[])
      : typeof raw === 'string'
        ? (JSON.parse(raw) as string[])
        : []
    const permissions = Array.isArray(parsed)
      ? parsed.map((p) => (typeof p === 'string' ? p.trim() : '')).filter(Boolean)
      : []

    return NextResponse.json({
      success: true,
      permissions,
      accessProfileName,
    })
  } catch (error) {
    console.error('[GET /api/auth/permissions]', error)
    return NextResponse.json(
      { success: false, permissions: [] },
      { status: 500 }
    )
  }
}
