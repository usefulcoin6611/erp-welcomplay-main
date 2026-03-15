/**
 * Permission Utilities
 * Helper functions for role-based access control (RBAC) and access-profile-based filtering.
 */

import type { UserRole } from '@/contexts/auth-context'

/**
 * Map route path (prefix) to required permission strings (REFERENCE_PERMISSIONS).
 * For employees with an access profile, route is allowed only if user has at least one of the listed permissions.
 * Must stay in sync with menu-config employee menu permissions.
 */
const ROUTE_ACCESS_PROFILE_PERMISSIONS: { prefix: string; permissions: string[] }[] = [
  { prefix: '/hrm-dashboard', permissions: ['show hrm dashboard'] },
  { prefix: '/hrm/reports', permissions: ['view employee', 'manage employee'] },
  { prefix: '/crm-dashboard', permissions: ['show crm dashboard'] },
  { prefix: '/crm/reports', permissions: ['manage lead', 'view lead', 'manage deal', 'view deal'] },
  { prefix: '/leads', permissions: ['manage lead', 'view lead', 'create lead', 'edit lead'] },
  { prefix: '/deals', permissions: ['manage deal', 'view deal', 'create deal', 'edit deal'] },
  { prefix: '/form_builder', permissions: ['manage form builder', 'create form builder', 'edit form builder'] },
  { prefix: '/contract', permissions: ['manage contract', 'create contract', 'edit contract', 'show contract'] },
  { prefix: '/pipelines', permissions: ['manage pipeline', 'manage lead stage', 'manage stage'] },
  { prefix: '/project-dashboard', permissions: ['show project dashboard'] },
  { prefix: '/projects', permissions: ['manage project', 'view project', 'create project'] },
  { prefix: '/taskboard', permissions: ['manage project task', 'view project task', 'create project task'] },
  { prefix: '/timesheet-list', permissions: ['manage timesheet', 'view timesheet', 'create timesheet'] },
  { prefix: '/bugs-report', permissions: ['manage bug report', 'create bug report', 'edit bug report', 'move bug report'] },
  { prefix: '/calendar', permissions: ['view project task', 'manage project task'] },
  { prefix: '/time-tracker', permissions: ['manage timesheet', 'view timesheet', 'create timesheet'] },
  { prefix: '/project_report', permissions: ['view project', 'manage project'] },
  { prefix: '/projectstages', permissions: ['manage project stage', 'manage project task stage'] },
  { prefix: '/account-dashboard', permissions: ['show account dashboard'] },
  { prefix: '/accounting/reports', permissions: ['manage report'] },
  { prefix: '/hrm/employees', permissions: ['manage employee', 'view employee'] },
  { prefix: '/hrm/payroll', permissions: ['manage pay slip', 'manage set salary', 'create pay slip', 'create set salary'] },
  { prefix: '/hrm/leave', permissions: ['manage leave', 'create leave', 'edit leave'] },
  { prefix: '/hrm/performance', permissions: ['manage appraisal', 'manage goal tracking', 'manage indicator'] },
  { prefix: '/hrm/training', permissions: ['manage training', 'manage trainer', 'manage training type'] },
  { prefix: '/hrm/recruitment', permissions: ['manage job application', 'manage job', 'manage job category', 'manage job stage'] },
  { prefix: '/hrm/admin', permissions: ['manage award', 'manage transfer', 'manage resignation', 'manage travel', 'manage promotion', 'manage complaint', 'manage warning', 'manage termination', 'manage announcement', 'manage holiday'] },
  { prefix: '/hrm/events', permissions: ['manage event', 'create event', 'edit event'] },
  { prefix: '/hrm/meetings', permissions: ['manage meeting', 'create meeting', 'edit meeting'] },
  { prefix: '/hrm/assets', permissions: ['view employee', 'manage employee'] },
  { prefix: '/hrm/documents', permissions: ['manage document', 'create document', 'edit document'] },
  { prefix: '/hrm/policies', permissions: ['manage company policy', 'create company policy', 'edit company policy'] },
  { prefix: '/hrm/setup', permissions: ['manage branch', 'manage department', 'manage designation', 'manage document type', 'manage leave type', 'manage payslip type', 'manage training type'] },
  { prefix: '/accounting/bank-account', permissions: ['manage bank account', 'show journal entry'] },
  { prefix: '/accounting/sales', permissions: ['manage revenue', 'show invoice'] },
  { prefix: '/accounting/purchases', permissions: ['manage bill', 'show bill'] },
  { prefix: '/accounting/double-entry', permissions: ['manage journal entry', 'show journal entry'] },
  { prefix: '/accounting/goal', permissions: ['manage goal'] },
  { prefix: '/accounting/budget', permissions: ['manage budget plan', 'create budget plan', 'edit budget plan', 'view budget plan'] },
  { prefix: '/accounting/setup', permissions: ['manage constant custom field', 'manage chart of account'] },
  { prefix: '/accounting/print-settings', permissions: ['manage print settings'] },
  { prefix: '/users', permissions: ['manage user', 'create user', 'edit user'] },
  { prefix: '/access-profiles', permissions: ['manage permission', 'create permission', 'edit permission'] },
  { prefix: '/clients', permissions: ['manage client', 'create client', 'edit client'] },
  { prefix: '/email_template', permissions: ['manage company settings'] },
  { prefix: '/products/services', permissions: ['manage product & service', 'show product & service'] },
  { prefix: '/products/stock', permissions: ['manage warehouse', 'show warehouse'] },
  { prefix: '/support', permissions: ['manage client dashboard'] },
  { prefix: '/zoom', permissions: ['manage zoom meeting', 'show zoom meeting'] },
  { prefix: '/notifications', permissions: ['manage company settings'] },
  { prefix: '/settings', permissions: ['manage company settings', 'manage business settings'] },
  { prefix: '/messenger', permissions: ['manage company settings'] },
]
/**
 * Routes that are ALWAYS accessible regardless of subscription plan status.
 * These are essential for account management and system setup.
 */
export const PLAN_EXEMPT_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/setup-company',
  '/settings',
  '/plans',
  '/profile',
]

/**
 * Check if the user's subscription plan is active.
 * Super Admin is always considered to have an active plan.
 */
export function hasActivePlan(user: { type: UserRole; plan?: string | null; planExpireDate?: Date | string | null; isActive?: boolean }): boolean {
  if (user.type === 'super admin') return true
  if (user.isActive === false) return false
  if (!user.plan) return false
  
  if (user.planExpireDate) {
    const expireDate = new Date(user.planExpireDate)
    return expireDate > new Date()
  }
  
  return true
}


/**
 * Check if the route is allowed by the given access profile permissions (for employee with assigned profile).
 * Only routes in the map are checked; routes not in the map are denied when using profile (strict).
 */
export function hasRouteAccessByProfile(route: string, userPermissions: string[]): boolean {
  if (!userPermissions?.length) return false
  const set = new Set(userPermissions.map((p) => p.trim().toLowerCase()))
  const normalized = route.replace(/\/$/, '') || '/'
  for (const { prefix, permissions } of ROUTE_ACCESS_PROFILE_PERMISSIONS) {
    const p = prefix.replace(/\/$/, '') || '/'
    if (normalized === p || (p !== '/' && normalized.startsWith(p + '/'))) {
      return permissions.some((perm) => set.has(perm.trim().toLowerCase()))
    }
  }
  return false
}

/**
 * Check if user has access to a route based on their role and optional access profile permissions.
 * When userRole is 'employee' and accessProfilePermissions is an array, route must also be allowed by the profile.
 */
export function hasRouteAccess(
  route: string,
  user: {
    id?: string | number
    type: UserRole
    permissions?: string[] | null
    plan?: string | null
    planExpireDate?: Date | string | null
    isActive?: boolean
  }
): boolean {
  const userRole = user.type
  const accessProfilePermissions = user.permissions

  // 1. Check if route is exempt from plan requirements
  const isExempt = PLAN_EXEMPT_ROUTES.some(r => 
    route === r || (r !== '/' && route.startsWith(r))
  )

  // 2. For non-exempt routes, check if user has active plan (only for Company and its associates)
  if (!isExempt && userRole !== 'super admin') {
    if (!hasActivePlan(user)) {
      return false // Soft Lock: Redirect to settings/plan usually handled by AuthWrapper
    }
  }

  // Define route access rules for each role
  const routePermissions: Record<UserRole, string[]> = {
    'super admin': [
      // Super Admin has access to everything
      '*',
    ],
    'company': [
      // Company has access to most routes including User Management (per menu-config)
      '/dashboard',
      '/setup-company',
      '/plans/', // Subscribe flow: /plans/[id]/subscribe
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
      '/messenger',
      '/email_template',
      '/leads',
      '/deals',
      '/form_builder',
      '/contract',
      '/project',
      '/taskboard',
      '/timesheet-list',
      '/bugs-report',
      '/calendar',
      '/time-tracker',
      '/project_report',
      '/projectstages',
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
      // When employee has no access profile: base routes only. When profile assigned, hasRouteAccessByProfile filters.
      '/hrm-dashboard',
      '/project-dashboard',
      '/hrm/',
      '/accounting/',
      '/users',
      '/users/',
      '/clients',
      '/products/',
      '/support',
      '/settings',
      '/zoom',
      '/notifications',
      '/messenger',
    ],
  }

  // Employee without access profile: minimal safe routes only (Support, Zoom, Messenger)
  // HRM/Project/Accounting require assigned profile - avoid leaking /hrm-dashboard etc. to unassigned employees
  const employeeBaseRoutes = ['/attendance', '/support', '/zoom', '/messenger']

  const allowedRoutes = routePermissions[userRole] || []

  // Super admin has access to everything
  if (allowedRoutes.includes('*')) {
    return true
  }

  // Employee without access profile: use strict base list only
  if (userRole === 'employee' && !Array.isArray(accessProfilePermissions)) {
    const baseAllowed = employeeBaseRoutes.some((r) => route === r || (r.endsWith('/') && route.startsWith(r)) || route.startsWith(r + '/'))
    return baseAllowed
  }

  // Role-based: check if route matches any allowed route (supports prefix matching)
  const roleAllowed = allowedRoutes.some((allowedRoute) => {
    if (route === allowedRoute) return true
    if (allowedRoute.endsWith('/') && route.startsWith(allowedRoute)) return true
    if (!allowedRoute.endsWith('/') && (route.startsWith(allowedRoute + '/') || route === allowedRoute)) return true
    return false
  })

  if (!roleAllowed) return false

  // For employee with access profile, require profile to allow this route
  if (userRole === 'employee' && Array.isArray(accessProfilePermissions)) {
    const employeeAlwaysAllowedPrefixes = ['/attendance', '/support', '/zoom', '/messenger']
    if (employeeAlwaysAllowedPrefixes.some((p) => route === p || route.startsWith(p + '/'))) {
      return true
    }
    return hasRouteAccessByProfile(route, accessProfilePermissions)
  }

  return true
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
  // User Management (Users, Access Profiles, Clients) - Company Admin only per ERP best practice
  if (isUserManagementRoute(route)) {
    return ['super admin', 'company']
  }

  // System setup routes - super admin only (some exceptions for company, employee with access profile)
  if (isSystemSetupRoute(route)) {
    if (
      route.startsWith('/crm/setup') ||
      route.startsWith('/accounting/setup') ||
      route.startsWith('/accounting/print-settings') ||
      route.startsWith('/hrm/setup/')
    ) {
      return ['super admin', 'company', 'employee']
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
