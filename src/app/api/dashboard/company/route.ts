import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = session.user as { role?: string; id: string }
    const role = user?.role ?? ""

    if (role !== "company") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    // Aggregate metrics for Company Dashboard
    const [
      totalEmployees,
      totalDepartments,
      totalBranches,
      totalCustomers,
      activeProjects,
      totalProjects,
      openDeals,
      activeLeads,
      totalRevenue,
      totalExpense
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.department.count(),
      prisma.branch.count(),
      prisma.customer.count(),
      prisma.project.count({ where: { status: "ongoing" } }),
      prisma.project.count(),
      prisma.deal.count({ where: { status: "Open" } }),
      prisma.lead.count({ where: { isActive: true } }),
      // Simplified Finance logic: sum amount from JournalEntry (needs more specific logic in production)
      prisma.journalEntry.aggregate({ _sum: { amount: true } }),
      // For expense, we'd traditionally filter by account type, but let's mock/simplify for now
      Promise.resolve({ _sum: { amount: 0 } }) 
    ])

    return NextResponse.json({
      success: true,
      data: {
        hrm: {
          totalEmployees,
          totalDepartments,
          totalBranches,
        },
        crm: {
          totalCustomers,
          openDeals,
          activeLeads,
        },
        project: {
          activeProjects,
          totalProjects,
        },
        finance: {
          totalRevenue: totalRevenue._sum.amount || 0,
          totalExpense: totalExpense._sum.amount || 0,
        },
        // For the trend chart, we can mock or aggregate by month
        revenueTrend: [
          { month: 'Jan', amount: 45000000 },
          { month: 'Feb', amount: 52000000 },
          { month: 'Mar', amount: 48000000 },
          { month: 'Apr', amount: 61000000 },
          { month: 'May', amount: 55000000 },
          { month: 'Jun', amount: 67000000 },
        ]
      }
    })
  } catch (error) {
    console.error("Company dashboard API error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data" },
      { status: 500 }
    )
  }
}
