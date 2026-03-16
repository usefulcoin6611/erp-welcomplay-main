import type { UserRole } from '@/contexts/auth-context'
import { hasActivePlan } from './permission-utils'

/**
 * Get redirect path based on user role and plan status.
 * Employee: /attendance
 * Company: /hrm-dashboard (if has plan) or /settings (if no plan)
 */
export function getRedirectPathByRole(user: { type: UserRole; plan?: string | null; planExpireDate?: Date | string | null; isActive?: boolean }): string {
  const role = user.type
  
  // For company role, check if they have an active plan
  if (role === 'company') {
    if (!hasActivePlan(user)) return '/settings?tab=subscription-plan'
    return '/dashboard'
  }

  switch (role) {
    case 'super admin':
      return '/dashboard'
    case 'client':
      return '/dashboard'
    case 'employee':
      return '/attendance'
    default:
      return '/dashboard'
  }
}
