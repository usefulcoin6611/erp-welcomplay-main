/**
 * Authentication Service
 * Handles all authentication operations
 */

import type { User, UserRole } from '@/contexts/auth-context'
import { apiClient } from './api-client'
import type { ApiResponse } from './api-client'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message?: string
  data?: {
    user: User
    token: string
  }
}

export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/login', credentials)
      
      if (response.success && response.data?.token && response.data?.user) {
        apiClient.setToken(response.data.token)
        this.currentUser = response.data.user
        this.setStoredUser(response.data.user)
        
        return {
          success: true,
          message: response.message || 'Login berhasil',
          data: {
            user: response.data.user,
            token: response.data.token,
          },
        }
      }
      
      return {
        success: false,
        message: response.message || 'Login gagal',
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login gagal. Silakan coba lagi.'
      }
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {})
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      apiClient.clearToken()
      this.currentUser = null
      this.clearStoredUser()
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser
    }

    try {
      const response = await apiClient.get<User>('/auth/me')
      if (response.success && response.data) {
        this.currentUser = response.data
        this.setStoredUser(response.data)
        return response.data
      }
    } catch (error) {
      console.error('Get current user error:', error)
      // Clear invalid token
      if (error instanceof Error && error.message.includes('401')) {
        this.clearStoredUser()
        apiClient.clearToken()
      }
    }

    return null
  }

  async refreshToken(): Promise<string | null> {
    try {
      const response = await apiClient.post<{ token: string }>('/auth/refresh', {})
      if (response.success && response.data?.token) {
        apiClient.setToken(response.data.token)
        return response.data.token
      }
    } catch (error) {
      console.error('Refresh token error:', error)
    }

    return null
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated()
  }

  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    
    try {
      const userStr = localStorage.getItem('current_user')
      if (userStr) {
        const user = JSON.parse(userStr) as User
        this.currentUser = user
        return user
      }
    } catch (error) {
      console.error('Parse stored user error:', error)
      // Clear corrupted data
      localStorage.removeItem('current_user')
    }

    return null
  }

  setStoredUser(user: User): void {
    if (typeof window === 'undefined') return
    this.currentUser = user
    try {
      localStorage.setItem('current_user', JSON.stringify(user))
    } catch (error) {
      console.error('Failed to store user:', error)
    }
  }

  clearStoredUser(): void {
    if (typeof window === 'undefined') return
    this.currentUser = null
    localStorage.removeItem('current_user')
  }
}

// Export singleton instance
export const authService = AuthService.getInstance()
