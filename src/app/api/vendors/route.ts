import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vendors = await prisma.vendor.findMany({
      include: {
        branch: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      data: vendors,
    })
  } catch (error: any) {
    console.error("Error fetching vendors:", error)
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data vendor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== "super admin" && userRole !== "company") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Akses ditolak" },
        { status: 403 }
      )
    }

    const data = await request.json()

    if (!data.name || !data.email || !data.vendorCode) {
      return NextResponse.json(
        { success: false, message: "Nama, Email, dan Vendor Code wajib diisi" },
        { status: 400 }
      )
    }

    const vendor = await prisma.vendor.create({
      data: {
        ...data,
        createdById: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Vendor berhasil dibuat",
      data: vendor,
    })
  } catch (error: any) {
    console.error("Error creating vendor:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Vendor Code atau Email sudah digunakan" },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: "Gagal membuat vendor" },
      { status: 500 }
    )
  }
}

