import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"
import { z } from "zod"

const sourceSchema = z.object({
  name: z.string().trim().min(1, "Nama source wajib diisi"),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const branchId = (session.user as any).branchId as string | null

    const sourceModel = (prisma as any).source
    if (sourceModel == null || typeof sourceModel.findMany !== "function") {
      return NextResponse.json({ success: true, data: [] })
    }

    const where: any = {}
    if (branchId) {
      where.branchId = branchId
    } else {
      where.branchId = null
    }

    const sources = await sourceModel.findMany({
      where,
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json({ success: true, data: sources })
  } catch (error) {
    console.error("Error fetching sources:", error)
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data source" },
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
    const validation = sourceSchema.safeParse(body)

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
    const branchId = ((session.user as any).branchId as string | null) ?? null

    const sourceModel = (prisma as any).source
    if (!sourceModel?.findFirst || !sourceModel?.create) {
      return NextResponse.json(
        { success: false, message: "Fitur source belum tersedia" },
        { status: 503 },
      )
    }

    const existing = await sourceModel.findFirst({
      where: {
        name,
        ...(branchId ? { branchId } : { branchId: null }),
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Nama source sudah digunakan" },
        { status: 400 },
      )
    }

    const source = await sourceModel.create({
      data: {
        name,
        branchId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Source berhasil dibuat",
      data: source,
    })
  } catch (error) {
    console.error("Error creating source:", error)
    return NextResponse.json(
      { success: false, message: "Gagal membuat source" },
      { status: 500 },
    )
  }
}

