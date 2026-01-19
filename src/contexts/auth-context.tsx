"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { authService, type LoginCredentials, type LoginResponse } from '@/lib/auth'

export type UserRole = 'super admin' | 'company' | 'client' | 'employee'

export interface User {
  id?: number | string
  email: string
  name: string
  type: UserRole
  avatar?: string
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<LoginResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const isLoggingOutRef = useRef(false)

  /**
   * Load user from token on mount
   * Fixed: Single setIsLoading call after all operations complete
   * Fixed: Prevent loadUser() setelah logout untuk avoid race condition
   */
  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      try {
        // Check jika sedang logout - skip loadUser
        if (isLoggingOutRef.current) {
          if (isMounted) {
            setUser(null)
            setIsLoading(false) // ✅ Pastikan false saat logout
          }
          return
        }

        // Check if authenticated
        if (!authService.isAuthenticated()) {
          if (isMounted) {
            setUser(null)
            setIsLoading(false)
          }
          return
        }

        // Try to get user from storage first (for fast initial render)
        const storedUser = authService.getStoredUser()
        if (storedUser && isMounted) {
          setUser(storedUser)
        }

        // Then try to fetch from API (update with fresh data)
        try {
          const userData = await authService.getCurrentUser()
          if (isMounted) {
            if (userData) {
              setUser(userData)
            } else {
              // If API call fails, clear everything
              authService.clearStoredUser()
              setUser(null)
            }
          }
        } catch (error) {
          console.error('Failed to load user:', error)
          if (isMounted) {
            // Clear stored data on error
            authService.clearStoredUser()
            setUser(null)
          }
        }
      } catch (error) {
        console.error('Unexpected error loading user:', error)
        if (isMounted) {
          setUser(null)
        }
      } finally {
        // ✅ Single setIsLoading call after all operations complete
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  /**
   * Login function - calls API and updates state
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await authService.login(credentials)
    
    if (response.success && response.data?.user) {
      setUser(response.data.user)
    }
    
    return response
  }, [])

  /**
   * Logout function - clears state and redirects
   * Fixed: Clear ALL tokens and data BEFORE redirect to prevent stale state
   * Based on: https://stackoverflow.com/questions/74168609/react-login-page-freezing-after-logout
   */
  const logout = useCallback(async (): Promise<void> => {
    // Set flag untuk prevent loadUser() trigger
    isLoggingOutRef.current = true
    
    // ✅ CRITICAL FIX 1: Clear ALL storage FIRST (synchronous)
    // Clear token and user data from localStorage BEFORE state update
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('current_user')
      // Clear any other auth-related storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('current_user')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
    }
    
    // ✅ CRITICAL FIX 2: Clear authService state
    // Clear token from apiClient and authService
    authService.clearStoredUser()
    // Note: apiClient.clearToken() will be called by authService.logout()
    
    // ✅ CRITICAL FIX 3: Clear React state (synchronous)
    // Set isAuthenticated to false by clearing user
    setUser(null)
    setIsLoading(false) // ✅ Set false immediately
    
    // ✅ CRITICAL FIX 4: Force redirect with window.location for complete reset
    // Use window.location instead of router.replace for complete page reset
    if (typeof window !== 'undefined') {
      // Small delay to ensure state is cleared
      setTimeout(() => {
        window.location.href = '/login'
      }, 0)
    } else {
      // Fallback to router if window is not available
      router.replace('/login')
    }
    
    // Reset flag setelah delay untuk allow loadUser() di mount berikutnya
    setTimeout(() => {
      isLoggingOutRef.current = false
    }, 1000) // Increased delay untuk ensure logout complete
  }, [router])

  /**
   * Refresh user data from API
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const userData = await authService.getCurrentUser()
      if (userData) {
        setUser(userData)
      } else {
        // If refresh fails, logout
        await logout()
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      await logout()
    }
  }, [logout])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  }), [user, isLoading, login, logout, refreshUser])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
