import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { z } from "zod"

const contractTypeSchema = z.object({
  name: z.string().trim().min(1, "Nama contract type wajib diisi").max(191),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contractTypes = await (prisma as any).contractType.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ success: true, data: contractTypes })
  } catch (error) {
    console.error("Error fetching contract types:", error)
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 },
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
        { status: 403 },
      )
    }

    const body = await request.json()
    const validation = contractTypeSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0]?.message ?? "Data tidak valid",
          errors: validation.error.format(),
        },
        { status: 400 },
      )
    }

    const { name } = validation.data

    const existing = await (prisma as any).contractType.findFirst({
      where: { name },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Nama contract type sudah digunakan" },
        { status: 400 },
      )
    }

    const contractType = await (prisma as any).contractType.create({
      data: {
        name,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Contract type berhasil dibuat",
      data: contractType,
    })
  } catch (error) {
    console.error("Error creating contract type:", error)
    return NextResponse.json(
      { success: false, message: "Gagal membuat contract type" },
      { status: 500 },
    )
  }
}

