/**
 * Authentication Utilities
 * Helper functions for authentication and authorization
 */

import type { UserRole } from '@/contexts/auth-context'

/**
 * Get redirect path based on user role.
 * Employee: /attendance (all employees can access; dedicated clock in/out and personal history).
 * Company: /hrm-dashboard (unchanged).
 */
export function getRedirectPathByRole(role: UserRole): string {
  switch (role) {
    case 'super admin':
      return '/dashboard'
    case 'company':
      return '/hrm-dashboard'
    case 'client':
      return '/dashboard'
    case 'employee':
      return '/attendance'
    default:
      return '/dashboard'
  }
}
