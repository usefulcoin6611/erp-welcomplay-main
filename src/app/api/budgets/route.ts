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

    const branchId = (session.user as any).branchId
    if (!branchId) {
      return NextResponse.json({ error: "User has no assigned branch" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const budget = await (prisma as any).budgetPlan.findFirst({
        where: {
          id,
          branchId,
        },
      })

      if (!budget) {
        return NextResponse.json(
          { success: false, message: "Budget plan tidak ditemukan" },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          id: budget.id,
          name: budget.name,
          from: String(budget.fromYear),
          budgetPeriod: budget.period,
          details: budget.details ?? null,
        },
      })
    }

    const budgets = await (prisma as any).budgetPlan.findMany({
      where: {
        branchId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const data = budgets.map((b: any) => ({
      id: b.id,
      name: b.name,
      from: String(b.fromYear),
      budgetPeriod: b.period,
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

    const body = await request.json().catch(() => null)
    const { name, from, budgetPeriod, details } = body || {}

    if (!name || !from || !budgetPeriod) {
      return NextResponse.json(
        { success: false, message: "name, from, budgetPeriod wajib diisi" },
        { status: 400 }
      )
    }

    const yearNum = Number(from)
    if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2100) {
      return NextResponse.json(
        { success: false, message: "from (year) harus berupa tahun yang valid" },
        { status: 400 }
      )
    }

    const budget = await (prisma as any).budgetPlan.create({
      data: {
        branchId,
        name,
        fromYear: yearNum,
        period: String(budgetPeriod),
        details: details ?? null,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: budget.id,
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

    const branchId = (session.user as any).branchId
    if (!branchId) {
      return NextResponse.json({ error: "User has no assigned branch" }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const { id, name, from, budgetPeriod, details } = body || {}

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id wajib diisi" },
        { status: 400 }
      )
    }

    const existing = await (prisma as any).budgetPlan.findFirst({
      where: {
        id,
        branchId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Budget plan tidak ditemukan" },
        { status: 404 }
      )
    }

    const updateData: any = {}

    if (name !== undefined) updateData.name = String(name)
    if (from !== undefined) {
      const yearNum = Number(from)
      if (!Number.isInteger(yearNum) || yearNum < 1900 || yearNum > 2100) {
        return NextResponse.json(
          { success: false, message: "from (year) harus berupa tahun yang valid" },
          { status: 400 }
        )
      }
      updateData.fromYear = yearNum
    }
    if (budgetPeriod !== undefined) updateData.period = String(budgetPeriod)
    if (details !== undefined) updateData.details = details

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data yang diupdate" },
        { status: 400 }
      )
    }

    await (prisma as any).budgetPlan.update({
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

    const branchId = (session.user as any).branchId
    if (!branchId) {
      return NextResponse.json({ error: "User has no assigned branch" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id wajib diisi" },
        { status: 400 }
      )
    }

    const existing = await (prisma as any).budgetPlan.findFirst({
      where: {
        id,
        branchId,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Budget plan tidak ditemukan" },
        { status: 404 }
      )
    }

    await (prisma as any).budgetPlan.delete({
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
