/**
 * Route Guard Component
 * Protects routes based on user role and permissions
 */

"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import type { UserRole } from '@/contexts/auth-context'
import { hasRouteAccess, getRequiredRoleForRoute, hasRole } from '@/lib/permission-utils'

interface RouteGuardProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  fallbackPath?: string
}

export function RouteGuard({ 
  children, 
  requiredRole,
  fallbackPath = '/dashboard'
}: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    // If not authenticated, auth-wrapper will handle redirect
    if (!isAuthenticated || !user) {
      return
    }

    // Check route access
    const hasAccess = hasRouteAccess(pathname || '', user.type)
    
    if (!hasAccess) {
      // User doesn't have access to this route
      router.replace(fallbackPath)
      return
    }

    // Check required role if specified
    if (requiredRole) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (!hasRole(user.type, allowedRoles)) {
        router.replace(fallbackPath)
        return
      }
    }

    // Check route-specific role requirements
    const routeRequiredRole = getRequiredRoleForRoute(pathname || '')
    if (routeRequiredRole && !hasRole(user.type, routeRequiredRole)) {
      router.replace(fallbackPath)
      return
    }
  }, [isAuthenticated, isLoading, user, pathname, router, requiredRole, fallbackPath])

  // Don't render children if still loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Don't render if user doesn't have access
  if (!isAuthenticated || !user) {
    return null
  }

  const hasAccess = hasRouteAccess(pathname || '', user.type)
  const routeRequiredRole = getRequiredRoleForRoute(pathname || '')

  // Check access and role requirements
  if (!hasAccess || (routeRequiredRole && !hasRole(user.type, routeRequiredRole))) {
    return null
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!hasRole(user.type, allowedRoles)) {
      return null
    }
  }

  return <>{children}</>
}
