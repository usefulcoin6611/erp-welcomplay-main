import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

export type CalendarEventItem = {
  id: string
  title: string
  date: string
  time: string
  type: "meeting" | "training" | "holiday" | "other"
  description?: string
  color?: string
}

/**
 * GET /api/hrm-dashboard/calendar
 * Returns unified calendar events from HRM Events, Meetings, and Trainings for the dashboard Event Calendar.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = session.user as { role?: string; branchId?: string | null }
    const role = user?.role ?? ""
    const branchId = user?.branchId ?? null
    const scopeByBranch =
      role !== "super admin" && role !== "company" && !!branchId

    let branchName: string | null = null
    if (scopeByBranch && branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId },
        select: { name: true },
      })
      branchName = branch?.name ?? null
    }

    const eventWhere = scopeByBranch && branchName ? { branch: branchName } : {}
    const meetingWhere = scopeByBranch && branchName ? { branch: branchName } : {}
    const trainingWhere = scopeByBranch && branchName ? { branch: branchName } : {}

    const [events, meetings, trainings, holidays] = await Promise.all([
      prisma.hrmEvent.findMany({
        where: eventWhere,
        orderBy: { startDate: "asc" },
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          color: true,
          description: true,
        },
      }),
      prisma.hrmMeeting.findMany({
        where: meetingWhere,
        orderBy: [{ meetingDate: "asc" }, { meetingTime: "asc" }],
        select: {
          id: true,
          title: true,
          meetingDate: true,
          meetingTime: true,
          note: true,
        },
      }),
      prisma.training.findMany({
        where: trainingWhere,
        orderBy: { startDate: "asc" },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          trainingType: { select: { name: true } },
        },
      }),
      prisma.hrmHoliday.findMany({
        orderBy: { startDate: "asc" },
        select: { id: true, name: true, startDate: true, endDate: true },
      }),
    ])

    const items: CalendarEventItem[] = []

    for (const e of events) {
      const start = e.startDate
      const end = e.endDate
      const startStr = start.toISOString().slice(0, 10)
      const endStr = end.toISOString().slice(0, 10)
      const timeStr = start.getHours() || start.getMinutes() ? `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}` : "00:00"
      if (startStr === endStr) {
        items.push({
          id: `event-${e.id}`,
          title: e.title,
          date: startStr,
          time: timeStr,
          type: "other",
          description: e.description ?? undefined,
          color: e.color ?? undefined,
        })
      } else {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().slice(0, 10)
          const t = dateStr === startStr ? timeStr : "00:00"
          items.push({
            id: `event-${e.id}-${dateStr}`,
            title: e.title,
            date: dateStr,
            time: t,
            type: "other",
            description: e.description ?? undefined,
            color: e.color ?? undefined,
          })
        }
      }
    }

    for (const m of meetings) {
      const dateStr = m.meetingDate.toISOString().slice(0, 10)
      items.push({
        id: `meeting-${m.id}`,
        title: m.title,
        date: dateStr,
        time: m.meetingTime || "00:00",
        type: "meeting",
        description: m.note ?? undefined,
      })
    }

    for (const t of trainings) {
      const start = t.startDate
      const end = t.endDate
      const startStr = start.toISOString().slice(0, 10)
      const endStr = end.toISOString().slice(0, 10)
      const title = t.trainingType?.name ?? "Training"
      const timeStr = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`
      if (startStr === endStr) {
        items.push({
          id: `training-${t.id}`,
          title,
          date: startStr,
          time: timeStr,
          type: "training",
        })
      } else {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().slice(0, 10)
          items.push({
            id: `training-${t.id}-${dateStr}`,
            title,
            date: dateStr,
            time: dateStr === startStr ? timeStr : "00:00",
            type: "training",
          })
        }
      }
    }

    for (const h of holidays) {
      const start = h.startDate
      const end = h.endDate
      const startStr = start.toISOString().slice(0, 10)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().slice(0, 10)
        items.push({
          id: `holiday-${h.id}-${dateStr}`,
          title: h.name,
          date: dateStr,
          time: "00:00",
          type: "holiday",
        })
      }
    }

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error("HRM dashboard calendar API error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to load calendar events" },
      { status: 500 }
    )
  }
}
