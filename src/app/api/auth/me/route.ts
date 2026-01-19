import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Access token required' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // For mock tokens, extract user ID from token
    if (token.startsWith('mock_token_')) {
      const parts = token.split('_')
      const userId = parseInt(parts[parts.length - 1])

      // Mock users data
      const mockUsers: Record<number, any> = {
        1: {
          id: 1,
          email: 'superadmin@example.com',
          name: 'Super Admin',
          type: 'super admin',
        },
        2: {
          id: 2,
          email: 'company@example.com',
          name: 'Company',
          type: 'company',
        },
        3: {
          id: 3,
          email: 'client@example.com',
          name: 'Client',
          type: 'client',
        },
        4: {
          id: 4,
          email: 'employee@example.com',
          name: 'Employee',
          type: 'employee',
        },
      }

      const user = mockUsers[userId]

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User tidak ditemukan' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: user,
      })
    }

    // TODO: In production, verify JWT token here
    // const payload = JWTUtils.verifyToken(token)
    // const user = await prisma.user.findUnique({ where: { id: parseInt(payload.userId) } })

    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Get current user error:', error)
    
    if (error instanceof Error && error.message.includes('Token')) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
