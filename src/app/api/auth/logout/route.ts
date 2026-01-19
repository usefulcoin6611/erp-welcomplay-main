import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/logout
 * Handle user logout
 */
export async function POST(request: NextRequest) {
  try {
    // In a real implementation, you might want to:
    // 1. Invalidate the token on the server
    // 2. Log the logout event
    // 3. Clear any server-side sessions

    return NextResponse.json({
      success: true,
      message: 'Logout berhasil',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
