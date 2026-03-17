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

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const sourceModel = (prisma as any).source
    if (sourceModel == null || typeof sourceModel.findMany !== "function") {
      return NextResponse.json({ success: true, data: [] })
    }

    const userBranches = await (prisma as any).branch.findMany({
      where: { ownerId: companyId },
      select: { id: true }
    })
    const branchIds = userBranches.map((b: any) => b.id)

    const sources = await sourceModel.findMany({
      orderBy: {
        createdAt: "asc",
      },
    }) as any[]

    const filteredSources = sources.filter((s: any) => branchIds.includes(s.branchId))

    return NextResponse.json({ success: true, data: filteredSources })
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

    const { id: userId, role, ownerId, branchId } = session.user as any
    const companyId = role === "company" ? userId : ownerId

    if (role !== "super admin" && role !== "company" && role !== "employee") {
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
        branch: { ownerId: companyId },
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

