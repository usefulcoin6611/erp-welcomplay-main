import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-server'
import { headers } from 'next/headers'

/**
 * GET /api/messenger/users
 * List users the current user can message (active users excluding self).
 * Optionally scoped by branch for non–super-admin users.
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

    const role = (session.user as { role?: string }).role
    const branchId = (session.user as { branchId?: string | null }).branchId ?? null
    const ownerId = (session.user as { ownerId?: string | null }).ownerId ?? null

    let where: any = {
      isActive: true,
      id: { not: currentUserId },
    }

    if (role === 'super admin') {
      // Super admin sees everyone
    } else if (role === 'company') {
      // Company sees all their employees
      where.ownerId = currentUserId
    } else {
      // Employees and others see people in the same company (owner) and the boss
      const effectiveOwnerId = ownerId || currentUserId // Fallback if ownerId is missing
      where.OR = [
        { ownerId: effectiveOwnerId },
        { id: effectiveOwnerId }
      ]
      // Ensure we still exclude self after the OR
      where = {
        AND: [
          where,
          { id: { not: currentUserId } }
        ]
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        accessProfile: { select: { name: true } },
        department: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    })

    const data = users.map((u: any) => ({
      id: u.id,
      name: u.name ?? u.email,
      email: u.email,
      image: u.image ?? null,
      accessProfileName: u.accessProfile?.name ?? null,
      departmentName: u.department?.name ?? null,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Messenger users API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
