import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth-server"

/**
 * GET /api/auth/me
 * Returns current user id and role for UI (e.g. hiding create/edit for client role).
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
      return NextResponse.json({ success: false }, { status: 401 })
    }
    const user = session.user as { id?: string; role?: string }
    return NextResponse.json({
      success: true,
      id: user.id,
      role: user.role ?? "employee",
    })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
