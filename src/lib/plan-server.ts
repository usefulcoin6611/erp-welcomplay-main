import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function checkPlanStatus() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { 
        authorized: false, 
        response: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }) 
    };
  }

  const user = session.user as any;

  // Super admin bypass
  if (user.role === "super admin") {
    return { authorized: true, user };
  }

  // Basic check for company and employee
  // If they have no plan but have a branchId, they need to select a plan
  if (user.branchId && !user.plan) {
    return { 
        authorized: false, 
        response: NextResponse.json({ 
            success: false, 
            message: "Subscription plan required", 
            code: "PLAN_REQUIRED" 
        }, { status: 403 }) 
    };
  }

  // Check expiration if plan exists
  if (user.plan && user.planExpireDate) {
    const expireDate = new Date(user.planExpireDate);
    if (expireDate < new Date()) {
        // If there is a pending plan (from a downgrade), activate it now
        if (user.pendingPlan) {
            const { prisma: db } = await import("@/lib/prisma");
            const newExpireDate = new Date();
            newExpireDate.setDate(newExpireDate.getDate() + 30);

            const updatedUser = await db.user.update({
                where: { id: user.id },
                data: {
                    plan: user.pendingPlan,
                    planExpireDate: newExpireDate,
                    pendingPlan: null
                }
            });

            return { authorized: true, user: updatedUser };
        }

        return { 
            authorized: false, 
            response: NextResponse.json({ 
                success: false, 
                message: "Subscription plan expired", 
                code: "PLAN_EXPIRED" 
            }, { status: 403 }) 
        };
    }
  }

  // Check manual inactive status
  if (user.isActive === false) {
    return { 
        authorized: false, 
        response: NextResponse.json({ 
            success: false, 
            message: "Account is inactive", 
            code: "ACCOUNT_INACTIVE" 
        }, { status: 403 }) 
    };
  }

  return { authorized: true, user };
}
