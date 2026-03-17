import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth-server"
import { headers } from "next/headers"

/**
 * GET /api/hrm-dashboard
 * Returns aggregate stats for HRM dashboard (StatsCards), synced with HRM module data.
 * Branch scoping matches HRM list APIs: when user is not super admin and not company but has branchId,
 * counts are scoped to that branch (Employee/Training/Trainer by branch name, Job/Customer by branchId).
 * Super admin and company see global counts.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: userId, role: userRole, ownerId, branchId } = session.user as any;
    const companyId = userRole === "company" ? userId : ownerId;

    const scopeByBranch =
      userRole !== "super admin" && userRole !== "company" && !!branchId

    let branchName: string | null = null
    if (scopeByBranch && branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: branchId, ownerId: companyId },
        select: { name: true },
      })
      branchName = branch?.name ?? null
    }

    const baseWhere = { ownerId: companyId };
    const employeeWhere = scopeByBranch && branchName ? { ...baseWhere, branch: branchName } : baseWhere;
    const trainerWhere = scopeByBranch && branchName ? { ...baseWhere, branch: branchName } : baseWhere;
    
    // Training/Job/Customer/Trainer might have different relations
    const trainingWhere = scopeByBranch && branchName 
      ? { employee: { ownerId: companyId }, branch: branchName } 
      : { employee: { ownerId: companyId } };
    
    const jobWhere = scopeByBranch && branchId 
      ? { branch: { ownerId: companyId, id: branchId } } 
      : { branch: { ownerId: companyId } };

    const customerWhere = scopeByBranch && branchId 
      ? { branch: { ownerId: companyId, id: branchId } } 
      : { branch: { ownerId: companyId } };

    const [
      totalEmployee,
      activeEmployee,
      totalCustomer,
      totalJobs,
      activeJobs,
      totalTrainer,
      trainingActive,
      trainingDone,
    ] = await Promise.all([
      prisma.employee.count({ where: employeeWhere }),
      prisma.employee.count({
        where: { ...employeeWhere, isActive: true },
      }),
      (prisma.customer as any).count({ where: customerWhere }),
      (prisma as any).job.count({ where: jobWhere }),
      (prisma as any).job.count({
        where: { ...jobWhere, status: "active" },
      }),
      prisma.trainer.count({ where: trainerWhere }),
      prisma.training.count({
        where: { ...trainingWhere, status: { in: ["Pending", "Started"] } },
      }),
      prisma.training.count({
        where: { ...trainingWhere, status: "Completed" },
      }),
    ])

    const staffStats = {
      totalStaff: totalEmployee,
      totalEmployee: activeEmployee,
      totalClient: totalCustomer,
    }
    const jobStats = {
      totalJobs,
      activeJobs,
      inactiveJobs: totalJobs - activeJobs,
    }
    const trainingStats = {
      totalTrainer: totalTrainer,
      activeTraining: trainingActive,
      doneTraining: trainingDone,
    }

    return NextResponse.json({
      success: true,
      data: { staffStats, jobStats, trainingStats },
    })
  } catch (error) {
    console.error("HRM dashboard API error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to load dashboard data" },
      { status: 500 }
    )
  }
}
