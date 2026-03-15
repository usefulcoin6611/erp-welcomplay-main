"use client"

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { getRedirectPathByRole } from '@/lib/auth-utils'
import { hasRouteAccess, getRequiredRoleForRoute, hasRole, hasActivePlan, PLAN_EXEMPT_ROUTES } from '@/lib/permission-utils'

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  // Guard to prevent infinite redirect loops
  const redirectingRef = useRef(false)
  const lastCheckedPathRef = useRef<string | null>(null)
  const lastCheckedAuthRef = useRef<string | null>(null)
  const redirectingToRef = useRef<string | null>(null) // Track where we're redirecting to
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Effect 1: Handle auth state changes (login/logout) - NO pathname in deps to prevent loop
  useEffect(() => {
    // Cleanup previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Don't process if still loading
    if (isLoading || !pathname) {
      return
    }

    // Create auth state key to prevent re-processing same auth state
    const authKey = `${isAuthenticated}-${user?.type || 'none'}-${user?.id || 'none'}`
    
    // Don't process if we already checked this auth state combination
    if (lastCheckedAuthRef.current === authKey) {
      return
    }

    // Mark auth state as checked
    lastCheckedAuthRef.current = authKey
    
    // Don't reset lastCheckedPathRef - keep it to prevent Effect 2 from re-checking
    
    // Inline check and redirect logic to avoid closure issues
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
    
    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      if (pathname !== '/login') {
        redirectingRef.current = true
        redirectingToRef.current = '/login'
        router.replace('/login')
        timeoutRef.current = setTimeout(() => {
          redirectingRef.current = false
          redirectingToRef.current = null
        }, 1000) // Increased timeout to prevent race
      }
      return
    }
    
    // If authenticated and trying to access login page, redirect to appropriate dashboard
    if (isAuthenticated && pathname === '/login' && user) {
      // Special case: Company owner without branchId should go to setup-company
      if (user.type === 'company' && !user.branchId) {
        router.replace('/setup-company')
        return
      }

      const redirectPath = getRedirectPathByRole(user as any)
      redirectingRef.current = true
      redirectingToRef.current = redirectPath
      router.replace(redirectPath)
      timeoutRef.current = setTimeout(() => {
        redirectingRef.current = false
        redirectingToRef.current = null
      }, 1000)
      return
    }

    // If authenticated, check route access based on role
    if (isAuthenticated && user && !isPublicRoute) {
      // ✅ SETUP REDIRECT: Company without branchId must go to setup-company
      if (user.type === 'company') {
        if (!user.branchId && pathname !== '/setup-company') {
          router.replace('/setup-company')
          return
        }
        if (user.branchId && pathname === '/setup-company') {
          // If no active plan, go directly to settings instead of flashing dashboard
          const redirectPath = getRedirectPathByRole(user as any)
          router.replace(redirectPath)
          return
        }
      }

      // Check if user has access to this route
      const hasAccess = hasRouteAccess(pathname, user)
      
      if (!hasAccess) {
        // Special case: if denied due to plan, redirect to subscription settings
        if (user.type === 'company' && user.branchId && !hasActivePlan(user)) {
           const exempt = PLAN_EXEMPT_ROUTES.some(r => pathname === r || (r !== '/' && pathname.startsWith(r)))
           if (!exempt) {
             router.replace('/settings?tab=subscription-plan')
             return
           }
        }

        const redirectPath = getRedirectPathByRole(user as any)
        redirectingRef.current = true
        redirectingToRef.current = redirectPath
        router.replace(redirectPath)
        timeoutRef.current = setTimeout(() => {
          redirectingRef.current = false
          redirectingToRef.current = null
        }, 1000)
        return
      }

      // Check route-specific role requirements
      const routeRequiredRole = getRequiredRoleForRoute(pathname)
      if (routeRequiredRole && !hasRole(user.type, routeRequiredRole)) {
        const redirectPath = getRedirectPathByRole(user as any)
        redirectingRef.current = true
        redirectingToRef.current = redirectPath
        router.replace(redirectPath)
        timeoutRef.current = setTimeout(() => {
          redirectingRef.current = false
          redirectingToRef.current = null
        }, 1000)
        return
      }
    }

    // No redirect needed
    redirectingRef.current = false
    redirectingToRef.current = null
  }, [isAuthenticated, isLoading, user, router, pathname]) // ✅ Include pathname but guard prevents loop

  // Effect 2: Handle pathname changes (navigation) - ONLY for user navigation, NOT redirects
  useEffect(() => {
    // Don't process if still loading, already redirecting, or no pathname
    if (isLoading || redirectingRef.current || !pathname) {
      return
    }

    // Don't process if we're currently redirecting to this pathname (prevent loop)
    if (redirectingToRef.current === pathname) {
      // Mark as checked to prevent re-checking
      lastCheckedPathRef.current = pathname
      return
    }

    // Don't process if pathname hasn't actually changed
    if (lastCheckedPathRef.current === pathname) {
      return
    }

    // Mark pathname as checked
    lastCheckedPathRef.current = pathname
    
    // Only check route access for user navigation (not redirects)
    // Don't redirect here - only check and allow/deny
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
    
    // If authenticated, check route access based on role
    if (isAuthenticated && user && !isPublicRoute) {
      // ✅ SETUP REDIRECT: Company without branchId must go to setup-company
      if (user.type === 'company' && !user.branchId && pathname !== '/setup-company') {
        router.replace('/setup-company')
        return
      }

      // Check if user has access to this route
      const hasAccess = hasRouteAccess(pathname, user)
      
      if (!hasAccess) {
        // Special case: if denied due to plan, redirect to subscription settings
        if (user.type === 'company' && user.branchId && !hasActivePlan(user)) {
           const exempt = PLAN_EXEMPT_ROUTES.some(r => pathname === r || (r !== '/' && pathname.startsWith(r)))
           if (!exempt) {
             router.replace('/settings?tab=subscription-plan')
             return
           }
        }

        // User navigated to unauthorized route - redirect
        const redirectPath = getRedirectPathByRole(user as any)
        redirectingRef.current = true
        redirectingToRef.current = redirectPath
        router.replace(redirectPath)
        timeoutRef.current = setTimeout(() => {
          redirectingRef.current = false
          redirectingToRef.current = null
        }, 1000)
        return
      }

      // Check route-specific role requirements
      const routeRequiredRole = getRequiredRoleForRoute(pathname)
      if (routeRequiredRole && !hasRole(user.type, routeRequiredRole)) {
        // User navigated to unauthorized route - redirect
        const redirectPath = getRedirectPathByRole(user as any)
        redirectingRef.current = true
        redirectingToRef.current = redirectPath
        router.replace(redirectPath)
        timeoutRef.current = setTimeout(() => {
          redirectingRef.current = false
          redirectingToRef.current = null
        }, 1000)
        return
      }
    }

    // No redirect needed - user navigation is allowed
    redirectingRef.current = false
  }, [pathname, isLoading, isAuthenticated, user, router]) // ✅ Include all deps for proper closure

  // Effect 3: Reset guards saat masuk login page (setelah logout) - AGGRESSIVE RESET
  useEffect(() => {
    if (pathname === '/login') {
      // Reset semua guards secara immediate untuk memastikan form bisa digunakan
      // Tidak perlu cek isAuthenticated atau isLoading - langsung reset
      redirectingRef.current = false
      redirectingToRef.current = null
      
      // Clear timeout jika ada
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      
      // Jangan reset lastCheckedPathRef dan lastCheckedAuthRef - biarkan untuk prevent re-check
    }
  }, [pathname]) // ✅ Hanya trigger saat pathname berubah ke /login

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      redirectingRef.current = false
      lastCheckedPathRef.current = null
      lastCheckedAuthRef.current = null
      redirectingToRef.current = null
    }
  }, [])

  // Don't show loading for public routes to avoid flash
  const isPublicRoute = pathname ? PUBLIC_ROUTES.some(route => pathname.startsWith(route)) : true
  
  // ✅ CRITICAL: Untuk public routes (terutama /login), jangan block rendering
  // bahkan jika isLoading=true - ini mencegah freeze setelah logout
  if (isLoading && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // ✅ PREVENT FLASH: Check route access synchronously before rendering children
  // This blocks unauthorized pages from rendering while useEffect handles the redirect
  if (isAuthenticated && user && !isPublicRoute) {
    const hasAccess = hasRouteAccess(pathname, user)
    
    // If no access (e.g. at /dashboard but plan expired), show loader instead of the page
    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )
    }
  }

  // ✅ Pastikan public routes selalu render, bahkan jika isLoading=true
  // Ini mencegah freeze saat logout → login page
  return <>{children}</>
}
