import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-server'
import { headers } from 'next/headers'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekBounds(date: Date): { start: Date; end: Date } {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(d.setDate(diff))
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function getMonthBounds(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0)
  const end = new Date(year, month, 0, 23, 59, 59, 999)
  return { start, end }
}

/**
 * GET /api/crm/reports?type=lead|deal&month=1&year=2024&fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
 * Returns aggregated report data for CRM Lead or Deal reports.
 * - general: weekly (this week), sources, monthly (by week in month)
 * - pipeline: count by stage
 * - staff (lead only, when fromDate & toDate): count by owner; deal: count by pipeline
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'lead' | 'deal' | null
    const monthParam = searchParams.get('month')
    const yearParam = searchParams.get('year')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')

    if (!type || !['lead', 'deal'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type; use lead or deal' }, { status: 400 })
    }

    const now = new Date()
    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear()
    const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1

    const branchId = (session.user as { branchId?: string | null })?.branchId ?? null

    const baseWhereLead = branchId ? { branchId, isActive: true } : { isActive: true }
    const baseWhereDeal = branchId ? { branchId, isActive: true } : { isActive: true }

    if (type === 'lead') {
      // This week: count by day of week (1=Mon .. 7=Sun)
      const { start: weekStart, end: weekEnd } = getWeekBounds(now)
      const leadsThisWeek = await prisma.lead.findMany({
        where: {
          ...baseWhereLead,
          createdAt: { gte: weekStart, lte: weekEnd },
        },
        select: { createdAt: true, sources: true, stageId: true, ownerId: true, date: true },
      })

      const weeklyByDay = [0, 0, 0, 0, 0, 0, 0]
      const dateField = (l: { date: Date | null; createdAt: Date }) => l.date ?? l.createdAt
      leadsThisWeek.forEach((l) => {
        const d = new Date(dateField(l))
        const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1
        weeklyByDay[dayIndex]++
      })

      // Sources: group by Lead.sources (string; treat as single key or split)
      const sourceCount: Record<string, number> = {}
      const allLeadsForSources = await prisma.lead.findMany({
        where: baseWhereLead,
        select: { sources: true },
      })
      allLeadsForSources.forEach((l) => {
        const key = (l.sources ?? '').trim() || 'Unspecified'
        sourceCount[key] = (sourceCount[key] ?? 0) + 1
      })
      const sourcesCategories = Object.keys(sourceCount).sort()
      const sourcesSeries = sourcesCategories.map((k) => sourceCount[k])

      // Monthly: selected month, count by week (1-4)
      const { start: monthStart, end: monthEnd } = getMonthBounds(year, month)
      const leadsInMonth = await prisma.lead.findMany({
        where: {
          ...baseWhereLead,
          createdAt: { gte: monthStart, lte: monthEnd },
        },
        select: { createdAt: true, date: true },
      })
      const weekCounts = [0, 0, 0, 0]
      leadsInMonth.forEach((l) => {
        const d = new Date(l.date ?? l.createdAt)
        const weekOfMonth = Math.min(Math.ceil(d.getDate() / 7), 4) - 1
        weekCounts[weekOfMonth]++
      })
      const monthlyCategories = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      const monthlySeries = weekCounts

      // Pipeline: count by stage
      const leadsForPipeline = await prisma.lead.findMany({
        where: baseWhereLead,
        include: { stage: { select: { name: true } } },
      })
      const stageCountLead: Record<string, number> = {}
      leadsForPipeline.forEach((l) => {
        const name = l.stage?.name ?? '—'
        stageCountLead[name] = (stageCountLead[name] ?? 0) + 1
      })
      const pipelineCategories = Object.keys(stageCountLead).sort()
      const pipelineSeries = [
        { name: 'Leads', data: pipelineCategories.map((c) => stageCountLead[c] ?? 0) },
      ]

      const response: {
        general: {
          weeklyLabels: string[]
          weeklySeries: number[]
          sourcesCategories: string[]
          sourcesSeries: number[]
          monthlyCategories: string[]
          monthlySeries: number[]
        }
        pipeline: { categories: string[]; series: { name: string; data: number[] }[] }
        staff?: { categories: string[]; series: number[] }
      } = {
        general: {
          weeklyLabels: DAYS,
          weeklySeries: weeklyByDay,
          sourcesCategories,
          sourcesSeries,
          monthlyCategories,
          monthlySeries,
        },
        pipeline: { categories: pipelineCategories, series: pipelineSeries },
      }

      if (fromDate && toDate) {
        const from = new Date(fromDate)
        const to = new Date(toDate)
        to.setHours(23, 59, 59, 999)
        const staffLeads = await prisma.lead.findMany({
          where: {
            ...baseWhereLead,
            createdAt: { gte: from, lte: to },
          },
          include: { owner: { select: { name: true } } },
        })
        const ownerCount: Record<string, number> = {}
        staffLeads.forEach((l) => {
          const name = l.owner?.name ?? 'Unassigned'
          ownerCount[name] = (ownerCount[name] ?? 0) + 1
        })
        const staffCategories = Object.keys(ownerCount).sort()
        response.staff = {
          categories: staffCategories,
          series: staffCategories.map((c) => ownerCount[c] ?? 0),
        }
      }

      return NextResponse.json({ success: true, data: response })
    }

    // type === 'deal'
    const { start: weekStart, end: weekEnd } = getWeekBounds(now)
    const dealsThisWeek = await prisma.deal.findMany({
      where: {
        ...baseWhereDeal,
        createdAt: { gte: weekStart, lte: weekEnd },
      },
      select: { createdAt: true, pipelineId: true, stageId: true },
    })

    const weeklyByDayDeal = [0, 0, 0, 0, 0, 0, 0]
    dealsThisWeek.forEach((d) => {
      const dayIndex = d.createdAt.getDay() === 0 ? 6 : d.createdAt.getDay() - 1
      weeklyByDayDeal[dayIndex]++
    })

    // Deal has no sources; use pipeline as proxy for "source" or return empty
    const dealsForPipelineSource = await prisma.deal.findMany({
      where: baseWhereDeal,
      include: { pipeline: { select: { name: true } } },
    })
    const pipelineAsSource: Record<string, number> = {}
    dealsForPipelineSource.forEach((d) => {
      const key = d.pipeline?.name ?? 'Unspecified'
      pipelineAsSource[key] = (pipelineAsSource[key] ?? 0) + 1
    })
    const dealSourcesCategories = Object.keys(pipelineAsSource).sort()
    const dealSourcesSeries = dealSourcesCategories.map((k) => pipelineAsSource[k])

    const { start: monthStart, end: monthEnd } = getMonthBounds(year, month)
    const dealsInMonth = await prisma.deal.findMany({
      where: {
        ...baseWhereDeal,
        createdAt: { gte: monthStart, lte: monthEnd },
      },
      select: { createdAt: true },
    })
    const dealWeekCounts = [0, 0, 0, 0]
    dealsInMonth.forEach((d) => {
      const weekOfMonth = Math.min(Math.ceil(d.createdAt.getDate() / 7), 4) - 1
      dealWeekCounts[weekOfMonth]++
    })

    const dealsForPipeline = await prisma.deal.findMany({
      where: baseWhereDeal,
      include: { stage: { select: { name: true } } },
    })
    const dealStageCount: Record<string, number> = {}
    dealsForPipeline.forEach((d) => {
      const name = d.stage?.name ?? '—'
      dealStageCount[name] = (dealStageCount[name] ?? 0) + 1
    })
    const dealPipelineCategories = Object.keys(dealStageCount).sort()
    const dealPipelineSeries = [
      { name: 'Deals', data: dealPipelineCategories.map((c) => dealStageCount[c] ?? 0) },
    ]

    const response: {
      general: {
        weeklyLabels: string[]
        weeklySeries: number[]
        sourcesCategories: string[]
        sourcesSeries: number[]
        monthlyCategories: string[]
        monthlySeries: number[]
      }
      pipeline: { categories: string[]; series: { name: string; data: number[] }[] }
      staff?: { categories: string[]; series: number[] }
    } = {
      general: {
        weeklyLabels: DAYS,
        weeklySeries: weeklyByDayDeal,
        sourcesCategories: dealSourcesCategories.length ? dealSourcesCategories : ['No pipeline'],
        sourcesSeries: dealSourcesSeries.length ? dealSourcesSeries : [0],
        monthlyCategories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        monthlySeries: dealWeekCounts,
      },
      pipeline: { categories: dealPipelineCategories, series: dealPipelineSeries },
    }

    if (fromDate && toDate) {
      const from = new Date(fromDate)
      const to = new Date(toDate)
      to.setHours(23, 59, 59, 999)
      const staffDeals = await prisma.deal.findMany({
        where: {
          ...baseWhereDeal,
          createdAt: { gte: from, lte: to },
        },
        include: { pipeline: { select: { name: true } } },
      })
      const pipelineCount: Record<string, number> = {}
      staffDeals.forEach((d) => {
        const name = d.pipeline?.name ?? 'Unspecified'
        pipelineCount[name] = (pipelineCount[name] ?? 0) + 1
      })
      const staffCategories = Object.keys(pipelineCount).sort()
      response.staff = {
        categories: staffCategories,
        series: staffCategories.map((c) => pipelineCount[c] ?? 0),
      }
    }

    return NextResponse.json({ success: true, data: response })
  } catch (error) {
    console.error('CRM reports API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to load report data' },
      { status: 500 }
    )
  }
}
