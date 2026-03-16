import { prisma } from './prisma';

export async function getPlanByName(name: string) {
  return await (prisma as any).plan.findUnique({
    where: { name }
  });
}

export async function getPlanById(id: string) {
  return await (prisma as any).plan.findUnique({
    where: { id }
  });
}

/**
 * Calculates the prorated credit from the current active plan.
 * Used when upgrading to a higher tier plan.
 */
export async function calculateUpgradeProration(userId: string, newPlanPrice: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpireDate: true }
  });

  if (!user || !user.plan || !user.planExpireDate) return 0;

  const currentPlan = await getPlanByName(user.plan);
  if (!currentPlan) return 0;

  // Only prorate if it's an upgrade
  if (newPlanPrice <= currentPlan.price) return 0;

  const now = new Date();
  if (user.planExpireDate <= now) return 0;

  // Calculate remaining days
  const remainingMs = user.planExpireDate.getTime() - now.getTime();
  const remainingDays = Math.max(0, remainingMs / (1000 * 60 * 60 * 24));
  
  // Assuming standard 30-day month for calculation
  const totalDays = 30; 
  const unusedValue = (remainingDays / totalDays) * currentPlan.price;

  return Math.round(unusedValue);
}

/**
 * Determines if a plan change is an upgrade or downgrade.
 */
export async function getPlanChangeType(currentPlanName: string | null, newPlanName: string) {
  if (!currentPlanName) return 'new';
  
  const currentPlan = await getPlanByName(currentPlanName);
  const newPlan = await getPlanByName(newPlanName);
  
  if (!currentPlan || !newPlan) return 'new';
  
  if (newPlan.price > currentPlan.price) return 'upgrade';
  if (newPlan.price < currentPlan.price) return 'downgrade';
  return 'renewal';
}
