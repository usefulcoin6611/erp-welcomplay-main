/**
 * API Client
 * Centralized API client for making HTTP requests
 * Handles authentication, error handling, and response parsing
 */

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export class ApiClient {
  private baseURL: string
  private token: string | null

  constructor(baseURL?: string) {
    this.baseURL = baseURL || process.env.NEXT_PUBLIC_API_URL || '/api'
    this.token = this.getStoredToken()
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  private setStoredToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('auth_token', token)
  }

  private removeStoredToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      (headers as any).Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      let data: any
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        throw new Error(text || `HTTP ${response.status}`)
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || `HTTP ${response.status}`
        const error = new Error(errorMessage)
        ;(error as any).status = response.status
        ;(error as any).data = data
        throw error
      }

      return data
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Tidak dapat terhubung ke server. Pastikan backend berjalan.')
      }
      
      // Handle 401 unauthorized
      if (error instanceof Error && ((error as any).status === 401 || error.message.includes('401'))) {
        this.removeStoredToken()
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
      
      throw error
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  // POST request
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // PUT request
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // PATCH request
  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // Set token (for login)
  setToken(token: string): void {
    this.token = token
    this.setStoredToken(token)
  }

  // Clear token (for logout)
  clearToken(): void {
    this.token = null
    this.removeStoredToken()
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.token
  }
}

// Create singleton instance
export const apiClient = new ApiClient()
