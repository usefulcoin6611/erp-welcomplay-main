import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = session.user as any;
    const role = user?.role ?? "";
    const userId = user?.id;
    const branchId = user?.branchId;

    if (role !== "company") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    if (!branchId) {
      return NextResponse.json({ success: false, message: "Branch not found" }, { status: 400 })
    }

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        label: d.toLocaleString('en-US', { month: 'short' }),
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      })
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
      completedProjectsCount,
      currentMonthEmployees,
      previousEmployees,
      financialGoal,
      ...monthlyRevenueRaw
    ] = await Promise.all([
      prisma.employee.count({ where: { ownerId: userId } }),
      prisma.department.count({ where: { branchId: branchId } }),
      prisma.branch.count({ where: { ownerId: userId } }),
      prisma.customer.count({ where: { branchId: branchId } }),
      prisma.project.count({ where: { status: "ongoing", branchId: branchId } }),
      prisma.project.count({ where: { branchId: branchId } }),
      prisma.deal.count({ where: { status: "Open", branchId: branchId } }),
      prisma.lead.count({ where: { isActive: true, branchId: branchId } }),
      prisma.journalEntry.aggregate({ 
        _sum: { amount: true },
        where: { branchId: branchId }
      }),
      prisma.project.count({ where: { status: "completed", branchId: branchId } }),
      prisma.employee.count({ 
        where: { 
          ownerId: userId,
          createdAt: { gte: firstDayOfMonth }
        } 
      }),
      prisma.employee.count({ 
        where: { 
          ownerId: userId,
          createdAt: { lt: firstDayOfMonth }
        } 
      }),
      prisma.financialGoal.findFirst({
        where: { 
          branchId: branchId,
          isDisplay: true,
          toDate: { gte: now }
        },
        orderBy: { createdAt: 'desc' }
      }),
      // Rolling 6 months revenue trend
      ...months.map(m => prisma.journalEntry.aggregate({
        _sum: { amount: true },
        where: {
          branchId: branchId,
          createdAt: { gte: m.start, lte: m.end }
        }
      }))
    ])

    const revenueTrend = months.map((m, idx) => ({
      month: m.label,
      amount: Number(monthlyRevenueRaw[idx]._sum.amount) || 0
    }))

    // Calculations for Organization Health
    const employeeGrowth = previousEmployees > 0 
      ? Math.round((currentMonthEmployees / previousEmployees) * 100)
      : (currentMonthEmployees > 0 ? 100 : 0)

    const projectCompletion = totalProjects > 0
      ? Math.round((completedProjectsCount / totalProjects) * 100)
      : 0

    const revenueAmount = totalRevenue._sum.amount || 0
    const salesTarget = financialGoal && financialGoal.amount > 0
      ? Math.min(100, Math.round((revenueAmount / financialGoal.amount) * 100))
      : 0

    return NextResponse.json({
      success: true,
      data: {
        hrm: { totalEmployees, totalDepartments, totalBranches, employeeGrowth },
        crm: { totalCustomers, openDeals, activeLeads },
        project: { activeProjects, totalProjects, projectCompletion },
        finance: { totalRevenue: revenueAmount, salesTarget },
        revenueTrend
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

