/**
 * Permission Utilities
 * Helper functions for role-based access control (RBAC)
 */

import type { UserRole } from '@/contexts/auth-context'

/**
 * Check if user has access to a route based on their role
 */
export function hasRouteAccess(route: string, userRole: UserRole): boolean {
  // Define route access rules for each role
  const routePermissions: Record<UserRole, string[]> = {
    'super admin': [
      // Super Admin has access to everything
      '*',
    ],
    'company': [
      // Company has access to most routes including User Management (per menu-config)
      '/dashboard',
      '/hrm-dashboard',
      '/account-dashboard',
      '/crm-dashboard',
      '/project-dashboard',
      '/pos-dashboard',
      '/pipelines',
      '/hrm/',
      '/accounting/',
      '/crm/',
      '/projects/',
      '/pos/',
      '/products/',
      '/support',
      '/settings',
      '/zoom',
      '/notifications',
      // User Management (company can manage users, access profiles, clients per UI requirement)
      '/users',
      '/users/',
      '/access-profiles', // Access Profiles page (permission sets for employees)
      '/clients',
    ],
    'client': [
      // Client has limited access - only CRM, Project, and Support
      '/dashboard',
      '/crm-dashboard',
      '/project-dashboard',
      '/deals',
      '/contract',
      '/projects',
      '/taskboard',
      '/bugs-report',
      '/calendar',
      '/support',
      '/settings',
      '/zoom',
      '/notifications',
    ],
    'employee': [
      // Employee has access to HRM Dashboard, Project, and Support only
      // NO access to Accounting, CRM, POS, or User Management (per ROLE_BASED_ACCESS.md)
      '/hrm-dashboard',
      '/project-dashboard',
      '/hrm/leave',
      '/hrm/events',
      '/hrm/meetings',
      '/hrm/documents',
      '/hrm/policies',
      '/projects/task',
      '/projects/timesheet/',
      '/projects/task/calendar',
      '/projects/time-tracker',
      '/support',
      '/settings',
      '/zoom',
      '/notifications',
    ],
  }

  const allowedRoutes = routePermissions[userRole] || []

  // Super admin has access to everything
  if (allowedRoutes.includes('*')) {
    return true
  }

  // Check if route matches any allowed route (supports prefix matching)
  return allowedRoutes.some((allowedRoute) => {
    // Exact match
    if (route === allowedRoute) {
      return true
    }
    // Prefix match (for routes like /hrm/, /accounting/)
    if (allowedRoute.endsWith('/') && route.startsWith(allowedRoute)) {
      return true
    }
    return false
  })
}

/**
 * Check if route is a user management route (super admin and company can access)
 */
export function isUserManagementRoute(route: string): boolean {
  const userManagementRoutes = [
    '/users',
    '/access-profiles', // Access Profiles
    '/users/clients',
    '/clients',
  ]
  return userManagementRoutes.some((r) => route.startsWith(r))
}

/**
 * Check if route is a system setup route (restricted based on role)
 */
export function isSystemSetupRoute(route: string): boolean {
  const setupRoutes = [
    '/hrm/setup/',
    '/accounting/setup',
    '/accounting/print-settings',
    '/projects/setup/',
    '/pos/setup/',
  ]
  return setupRoutes.some((r) => route.startsWith(r))
}

/**
 * Get required role for a route
 */
export function getRequiredRoleForRoute(route: string): UserRole[] | null {
  // User management routes - super admin and company (per menu-config)
  if (isUserManagementRoute(route)) {
    return ['super admin', 'company']
  }

  // System setup routes - super admin only (some exceptions for company)
  if (isSystemSetupRoute(route)) {
    if (
      route.startsWith('/crm/setup') ||
      route.startsWith('/accounting/setup') ||
      route.startsWith('/accounting/print-settings') ||
      route.startsWith('/hrm/setup/')
    ) {
      return ['super admin', 'company']
    }
    return ['super admin']
  }

  // No specific role requirement (all authenticated users)
  return null
}

/**
 * Check if user role is in allowed roles list
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}
