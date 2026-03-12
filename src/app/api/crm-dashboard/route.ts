import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/crm-dashboard
 * Returns stats, lead/deal by stage, and latest contracts for CRM dashboard.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const [totalLead, totalDeal, totalContract, leads, deals] = await Promise.all([
      prisma.lead.count(),
      prisma.deal.count(),
      prisma.contract.count(),
      prisma.lead.findMany({
        select: { stageId: true, stage: { select: { name: true } } },
      }),
      prisma.deal.findMany({
        select: { stageId: true, stage: { select: { name: true } } },
      }),
    ])

    const totalL = totalLead || 1
    const leadCountByStage: Record<string, number> = {}
    leads.forEach((l) => {
      const name = l.stage?.name ?? "—"
      leadCountByStage[name] = (leadCountByStage[name] ?? 0) + 1
    })
    const leadByStage = Object.entries(leadCountByStage).map(([stage, count]) => ({
      stage,
      count,
      percentage: Math.round((count / totalL) * 1000) / 10,
    }))

    const totalD = totalDeal || 1
    const dealCountByStage: Record<string, number> = {}
    deals.forEach((d) => {
      const name = d.stage?.name ?? "—"
      dealCountByStage[name] = (dealCountByStage[name] ?? 0) + 1
    })
    const dealByStage = Object.entries(dealCountByStage).map(([stage, count]) => ({
      stage,
      count,
      percentage: Math.round((count / totalD) * 1000) / 10,
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalLead,
        totalDeal,
        totalContract,
        leadByStage,
        dealByStage,
      },
    })
  } catch (error) {
    console.error("CRM dashboard API error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data" },
      { status: 500 }
    )
  }
}
