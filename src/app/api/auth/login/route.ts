import { auth } from "@/lib/auth-server";
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/login
 * Handle user login using BetterAuth
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

    const formattedEmail = email.toLowerCase().trim();

    console.log(`[Login Attempt] Email: ${formattedEmail}`);

    // Attempt login via BetterAuth
    try {
      const result = await auth.api.signInEmail({
        body: {
          email: formattedEmail,
          password,
        },
        asResponse: true, // Use asResponse to get headers/cookies
      });

      // result is a Response object when asResponse: true
      const authData = await result.json();

      if (!authData || !authData.user) {
        return NextResponse.json(
          { success: false, message: 'Email atau password salah' },
          { status: 401 }
        )
      }

      // Create response with user data
      const response = NextResponse.json({
        success: true,
        message: 'Login berhasil',
        data: {
          token: 'session',
          user: {
            id: authData.user.id,
            email: authData.user.email,
            name: authData.user.name,
            type: (authData.user as any).role || 'employee',
          },
        },
      });

      // Copy set-cookie headers from BetterAuth response to our response
      const setCookie = result.headers.get('set-cookie');
      if (setCookie) {
        response.headers.set('set-cookie', setCookie);
      }

      return response;
    } catch (authError: any) {
      console.error('[BetterAuth Error]:', authError);
      
      if (authError.code === 'INVALID_EMAIL_OR_PASSWORD' || authError.status === 401) {
        return NextResponse.json(
          { success: false, message: 'Email atau password salah' },
          { status: 401 }
        )
      }
      throw authError;
    }
  } catch (error: any) {
    console.error('Login route error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
