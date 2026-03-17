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

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const contractTypes = await (prisma.contractType as any).findMany({
      orderBy: {
        createdAt: "desc",
      },
    }) as any[]

    const userBranches = await (prisma as any).branch.findMany({
      where: { ownerId: companyId },
      select: { id: true }
    })
    const branchIds = userBranches.map((b: any) => b.id)

    const filteredData = contractTypes.filter((ct: any) => 
      branchIds.includes(ct.branchId) || !ct.branchId
    )

    const data = filteredData.map((ct: any) => ({
      id: ct.id,
      name: ct.name,
    }))
    return NextResponse.json({ success: true, data })
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

    const { id: userId, role, ownerId, branchId } = session.user as any
    const companyId = role === "company" ? userId : ownerId

    if (role !== "super admin" && role !== "company" && role !== "employee") {
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

    const existing = await prisma.contractType.findFirst({
      where: { 
        name,
        branch: { ownerId: companyId }
      },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Nama contract type sudah digunakan" },
        { status: 400 },
      )
    }

    const created = await prisma.contractType.create({
      data: { 
        name,
        branchId: branchId || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Contract type berhasil dibuat",
      data: { id: created.id, name: created.name },
    })
  } catch (error) {
    console.error("Error creating contract type:", error)
    return NextResponse.json(
      { success: false, message: "Gagal membuat contract type" },
      { status: 500 },
    )
  }
}

