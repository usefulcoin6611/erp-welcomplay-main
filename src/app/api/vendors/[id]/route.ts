import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        branch: true,
      },
    })

    if (!vendor) {
      return NextResponse.json(
        { success: false, message: "Vendor tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: vendor,
    })
  } catch (error: any) {
    console.error("Error fetching vendor:", error)
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data vendor" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const vendor = await prisma.vendor.update({
      where: { id },
      data: {
        ...data,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Vendor berhasil diperbarui",
      data: vendor,
    })
  } catch (error: any) {
    console.error("Error updating vendor:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Vendor tidak ditemukan" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui vendor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    await prisma.vendor.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Vendor berhasil dihapus",
    })
  } catch (error: any) {
    console.error("Error deleting vendor:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { success: false, message: "Vendor tidak ditemukan" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, message: "Gagal menghapus vendor" },
      { status: 500 }
    )
  }
}

