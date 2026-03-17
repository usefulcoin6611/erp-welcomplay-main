import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

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

    const userBranches = await prisma.branch.findMany({
      where: { ownerId: companyId },
      select: { id: true }
    })
    const branchIds = userBranches.map((b: any) => b.id)

    const goals = await (prisma as any).financialGoal.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    const filteredGoals = goals.filter((g: any) => branchIds.includes(g.branchId))

    const data = filteredGoals.map((g: any) => ({
      id: g.id,
      name: g.name,
      type: g.type,
      from: g.fromDate.toISOString().slice(0, 10),
      to: g.toDate.toISOString().slice(0, 10),
      amount: g.amount,
      is_display: g.isDisplay ? 1 : 0,
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
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

    const branchId = (session.user as any).branchId
    if (!branchId) {
      return NextResponse.json({ error: "User has no assigned branch" }, { status: 400 })
    }

    const body = await request.json()
    const { name, type, from, to, amount, is_display } = body || {}

    if (
      !name ||
      !type ||
      !from ||
      !to ||
      amount === undefined ||
      amount === null
    ) {
      return NextResponse.json(
        { success: false, message: "name, type, from, to, amount wajib diisi" },
        { status: 400 }
      )
    }

    const fromDate = new Date(`${from}T00:00:00.000Z`)
    const toDate = new Date(`${to}T00:00:00.000Z`)

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Format tanggal tidak valid" },
        { status: 400 }
      )
    }

    if (toDate < fromDate) {
      return NextResponse.json(
        { success: false, message: "Tanggal selesai tidak boleh sebelum tanggal mulai" },
        { status: 400 }
      )
    }

    const parsedAmount =
      typeof amount === "string" ? parseFloat(amount) : Number(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json(
        { success: false, message: "amount harus berupa angka positif" },
        { status: 400 }
      )
    }

    const goal = await (prisma as any).financialGoal.create({
      data: {
        branchId,
        name,
        type,
        fromDate,
        toDate,
        amount: parsedAmount,
        isDisplay: Boolean(is_display),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: goal.id,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const userBranches = await prisma.branch.findMany({
      where: { ownerId: companyId },
      select: { id: true }
    })
    const branchIds = userBranches.map((b: any) => b.id)

    const body = await request.json()
    const { id, name, type, from, to, amount, is_display } = body || {}

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id wajib diisi" },
        { status: 400 }
      )
    }

    const existing = await (prisma as any).financialGoal.findFirst({
      where: {
        id,
        branchId: { in: branchIds },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Financial goal tidak ditemukan atau tidak dapat diakses" },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type

    if (from !== undefined) {
      const fromDate = new Date(`${from}T00:00:00.000Z`)
      if (Number.isNaN(fromDate.getTime())) {
        return NextResponse.json(
          { success: false, message: "Format tanggal mulai tidak valid" },
          { status: 400 }
        )
      }
      updateData.fromDate = fromDate
    }

    if (to !== undefined) {
      const toDate = new Date(`${to}T00:00:00.000Z`)
      if (Number.isNaN(toDate.getTime())) {
        return NextResponse.json(
          { success: false, message: "Format tanggal selesai tidak valid" },
          { status: 400 }
        )
      }
      updateData.toDate = toDate
    }

    if (amount !== undefined) {
      const parsedAmount =
        typeof amount === "string" ? parseFloat(amount) : Number(amount)

      if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
        return NextResponse.json(
          { success: false, message: "amount harus berupa angka positif" },
          { status: 400 }
        )
      }
      updateData.amount = parsedAmount
    }

    if (is_display !== undefined) {
      updateData.isDisplay = Boolean(is_display)
    }

    await (prisma as any).financialGoal.update({
      where: { id: existing.id },
      data: updateData,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: userId, role, ownerId } = session.user as any;
    const companyId = role === "company" ? userId : ownerId;

    const userBranches = await prisma.branch.findMany({
      where: { ownerId: companyId },
      select: { id: true }
    })
    const branchIds = userBranches.map((b: any) => b.id)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id wajib diisi" },
        { status: 400 }
      )
    }

    const existing = await (prisma as any).financialGoal.findFirst({
      where: {
        id,
        branchId: { in: branchIds },
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Financial goal tidak ditemukan atau tidak dapat diakses" },
        { status: 404 }
      )
    }

    await (prisma as any).financialGoal.delete({
      where: { id: existing.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
