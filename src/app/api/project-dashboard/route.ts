import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth-server'
import { headers } from 'next/headers'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Map DB status to dashboard status key for grouping */
function projectStatusGroup(status: string): 'on_going' | 'on_hold' | 'complete' | 'cancelled' {
  switch (status) {
    case 'in_progress':
    case 'not_started':
      return 'on_going'
    case 'on_hold':
      return 'on_hold'
    case 'finished':
      return 'complete'
    case 'cancel':
      return 'cancelled'
    default:
      return 'on_going'
  }
}

/**
 * GET /api/project-dashboard
 * Returns aggregated data for project dashboard: stats, project status, tasks overview (last 7 days), top due projects, timesheet hours (last 7 days), top due tasks.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const branchId = (session.user as { branchId?: string | null })?.branchId ?? null
    const whereProject = branchId ? { branchId } : {}

    const [
      projects,
      tasks,
      expenseAgg,
      timesheets,
      tasksWithProject,
    ] = await Promise.all([
      prisma.project.findMany({
        where: whereProject,
        select: {
          id: true,
          projectId: true,
          name: true,
          status: true,
          progress: true,
          budget: true,
          endDate: true,
        },
      }),
      prisma.projectTask.findMany({
        where: { project: whereProject },
        select: { id: true, completion: true, endDate: true, name: true, priority: true, projectId: true, updatedAt: true },
      }),
      prisma.expense.aggregate({
        where: branchId ? { branchId } : {},
        _sum: { total: true },
      }),
      prisma.timesheet.findMany({
        where: {
          project: whereProject,
          date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        select: { date: true, minutes: true },
        orderBy: { date: 'asc' },
      }),
      prisma.projectTask.findMany({
        where: {
          project: whereProject,
          endDate: { not: null },
        },
        select: {
          id: true,
          taskKey: true,
          name: true,
          priority: true,
          completion: true,
          endDate: true,
          projectId: true,
          project: { select: { name: true } },
        },
        orderBy: { endDate: 'asc' },
        take: 20,
      }),
    ])

    const totalProjects = projects.length
    const totalTasks = tasks.length
    const totalExpense = Number(expenseAgg._sum.total ?? 0)
    const completedTasks = tasks.filter((t) => t.completion >= 100).length
    const taskCompletionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const projectCompletionPercent = totalProjects > 0
      ? Math.round(projects.reduce((s, p) => s + (p.progress ?? 0), 0) / totalProjects)
      : 0

    const statusCount: Record<string, number> = { on_going: 0, on_hold: 0, complete: 0, cancelled: 0 }
    projects.forEach((p) => {
      const key = projectStatusGroup(p.status)
      statusCount[key]++
    })
    const totalForStatus = totalProjects || 1
    const projectStatuses = [
      { status: 'on_going', total: statusCount.on_going, percentage: Math.round((statusCount.on_going / totalForStatus) * 100) },
      { status: 'on_hold', total: statusCount.on_hold, percentage: Math.round((statusCount.on_hold / totalForStatus) * 100) },
      { status: 'complete', total: statusCount.complete, percentage: Math.round((statusCount.complete / totalForStatus) * 100) },
      { status: 'cancelled', total: statusCount.cancelled, percentage: Math.round((statusCount.cancelled / totalForStatus) * 100) },
    ]

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      return d
    })
    const dayKeys = last7Days.map((d) => d.toISOString().slice(0, 10))
    const completedCountsByDay = new Map<string, number>()
    dayKeys.forEach((k) => completedCountsByDay.set(k, 0))
    tasks.forEach((t) => {
      if (Number(t.completion) >= 100 && t.updatedAt) {
        const key = t.updatedAt.toISOString().slice(0, 10)
        if (completedCountsByDay.has(key)) completedCountsByDay.set(key, (completedCountsByDay.get(key) ?? 0) + 1)
      }
    })
    const tasksOverview = dayKeys.map((day) => ({
      day: DAYS[new Date(day).getDay()],
      tasks: completedCountsByDay.get(day) ?? 0,
    }))

    const minutesByDay = new Map<string, number>()
    dayKeys.forEach((k) => minutesByDay.set(k, 0))
    timesheets.forEach((t) => {
      const key = t.date.toISOString().slice(0, 10)
      if (minutesByDay.has(key)) minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + t.minutes)
    })
    const maxMinutes = Math.max(1, ...Array.from(minutesByDay.values()))
    const timesheetLoggedHours = dayKeys.map((day) => {
      const mins = minutesByDay.get(day) ?? 0
      const pct = Math.round((mins / maxMinutes) * 100)
      return { day: DAYS[new Date(day).getDay()], hours: Math.min(100, pct), minutes: mins }
    })

    const topDueProjects = projects
      .filter((p) => p.endDate != null)
      .sort((a, b) => (a.endDate!.getTime() - b.endDate!.getTime()))
      .slice(0, 10)
      .map((p) => ({
        id: p.projectId,
        name: p.name,
        budget: p.budget,
        endDate: p.endDate ? p.endDate.toISOString().slice(0, 10) : '',
        status: projectStatusGroup(p.status),
      }))

    const topDueTasks = tasksWithProject.slice(0, 10).map((t) => ({
      id: t.id,
      taskKey: t.taskKey,
      task: t.name,
      project: t.project?.name ?? '',
      stage: (t.priority || 'medium').toLowerCase(),
      completion: `${Math.round(Number(t.completion) ?? 0)}%`,
      endDate: t.endDate ? t.endDate.toISOString().slice(0, 10) : '',
    }))

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProjects,
          totalTasks,
          totalExpense,
          projectCompletionPercent,
          taskCompletionPercent,
        },
        projectStatuses,
        tasksOverview,
        timesheetLoggedHours,
        topDueProjects,
        topDueTasks,
      },
    })
  } catch (error) {
    console.error('Project dashboard API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to load project dashboard data' },
      { status: 500 }
    )
  }
}
