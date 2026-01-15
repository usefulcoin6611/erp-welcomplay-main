"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route))
      
      // If not authenticated and trying to access protected route, redirect to login
      if (!isAuthenticated && !isPublicRoute && pathname) {
        router.push('/login')
      }
      
      // If authenticated and trying to access login page, redirect to dashboard
      if (isAuthenticated && pathname === '/login') {
        router.push('/hrm-dashboard')
      }
    }
  }, [isAuthenticated, isLoading, pathname, router])

  // Don't show loading for public routes to avoid flash
  const isPublicRoute = pathname ? PUBLIC_ROUTES.some(route => pathname.startsWith(route)) : true
  
  if (isLoading && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <>{children}</>
}
