import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/login
 * Handle user login
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email dan password wajib diisi' },
        { status: 400 }
      )
    }

    // TODO: Replace with actual database query
    // For now, use mock authentication
    const mockUsers = [
      {
        email: 'superadmin@example.com',
        password: '1234',
        user: {
          id: 1,
          email: 'superadmin@example.com',
          name: 'Super Admin',
          type: 'super admin' as const,
        },
      },
      {
        email: 'company@example.com',
        password: '1234',
        user: {
          id: 2,
          email: 'company@example.com',
          name: 'Company',
          type: 'company' as const,
        },
      },
      {
        email: 'client@example.com',
        password: '1234',
        user: {
          id: 3,
          email: 'client@example.com',
          name: 'Client',
          type: 'client' as const,
        },
      },
      {
        email: 'employee@example.com',
        password: '1234',
        user: {
          id: 4,
          email: 'employee@example.com',
          name: 'Employee',
          type: 'employee' as const,
        },
      },
    ]

    // Find user
    const userData = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Generate mock token (in production, use JWT)
    const token = `mock_token_${Date.now()}_${userData.user.id}`

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: userData.user,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
