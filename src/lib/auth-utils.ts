/**
 * Authentication Utilities
 * Helper functions for authentication and authorization
 */

import type { UserRole } from '@/contexts/auth-context'

/**
 * Get redirect path based on user role
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
      return '/employee-dashboard'
    default:
      return '/dashboard'
  }
}
