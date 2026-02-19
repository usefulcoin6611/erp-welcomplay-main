"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Loader2, Mail, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { authService, type LoginCredentials } from "@/lib/auth"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { refreshUser, isLoading: contextIsLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ CRITICAL: Reset form state saat mount atau saat pathname berubah ke /login
  // Fixed: Based on React login freeze solutions - ensure clean state
  useEffect(() => {
    // ✅ FIX 1: Clear any stale auth state
    // Pastikan form selalu enabled saat mount atau saat masuk /login
    setIsLoading(false)
    setError(null)
    
    // ✅ FIX 2: Verify no stale tokens exist
    // Double-check localStorage is clean (defensive programming)
    if (typeof window !== 'undefined' && pathname === '/login') {
      // Don't clear on every render, only when explicitly on login page
      const hasToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
      if (hasToken && !contextIsLoading) {
        // If token exists but we're on login page, something is wrong
        // This shouldn't happen, but clear it defensively
        console.warn('Stale token detected on login page, clearing...')
        localStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_token')
      }
    }
    
    // ✅ FIX 3: Force enable form di DOM level (bypass React state)
    // Ini bypass semua React state dan langsung enable form
    const forceEnableForm = () => {
      if (typeof document !== 'undefined') {
        const form = document.querySelector('form')
        if (form) {
          const inputs = form.querySelectorAll('input, button')
          inputs.forEach((el: any) => {
            if (el.disabled) {
              el.disabled = false
            }
            // Remove pointer-events: none jika ada
            if (el.style.pointerEvents === 'none') {
              el.style.pointerEvents = 'auto'
            }
            // Remove any CSS that might block interaction
            if (el.style.opacity === '0' || el.style.visibility === 'hidden') {
              el.style.opacity = '1'
              el.style.visibility = 'visible'
            }
          })
        }
      }
    }
    
    // Force enable immediately
    forceEnableForm()
    
    // Force enable dengan delay untuk ensure DOM ready
    const timer1 = setTimeout(forceEnableForm, 0)
    const timer2 = setTimeout(forceEnableForm, 50)
    const timer3 = setTimeout(forceEnableForm, 100)
    const timer4 = setTimeout(forceEnableForm, 200) // Extra delay
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [pathname, contextIsLoading]) // Trigger saat pathname berubah atau context loading changes
  
  // ✅ Additional guard: Pastikan form tidak disabled karena context isLoading
  // Gunakan local isLoading, bukan context isLoading untuk form state
  // CRITICAL: Jangan gunakan contextIsLoading untuk disable form - hanya local state

  // ✅ Removed redirect from useEffect
  // AuthWrapper will handle redirect automatically when isAuthenticated becomes true

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate form
      if (!email.trim()) {
        setError("Email wajib diisi")
        setIsLoading(false)
        return
      }

      if (!password.trim()) {
        setError("Password wajib diisi")
        setIsLoading(false)
        return
      }

      // Call login API directly using authService
      const credentials: LoginCredentials = { email: email.toLowerCase().trim(), password }
      
      // ✅ FIX: Use direct fetch to our custom API route to ensure session is handled correctly
      const fetchResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const response = await fetchResponse.json();

      if (response.success && response.data?.user) {
        // Update auth context (this will trigger AuthWrapper to handle redirect)
        try {
          await refreshUser()
        } catch (err) {
          console.error('Failed to refresh user context:', err)
          // Continue anyway since authService already has the user
        }

        // Show success toast
        toast({
          title: "Login Berhasil!",
          description: "Selamat datang kembali!",
          variant: "default",
        })

        // ✅ Removed redirect - AuthWrapper will handle it automatically
        // This prevents competing redirects that cause freeze
      } else {
        const errorMsg = response.message || "Email atau password salah"
        setError(errorMsg)
        setIsLoading(false)
        
        toast({
          title: "Login Gagal",
          description: errorMsg,
          variant: "destructive",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi."
      setError(errorMessage)
      setIsLoading(false)
      
      toast({
        title: "Login Gagal",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden"
      style={{ 
        minHeight: '100dvh',
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header with Logo */}
      <header className="relative z-10 p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/avatars/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <span className="text-xl font-bold text-gray-900">ERP System</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center relative z-10 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Title */}
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Login</h2>
              <p className="text-sm text-gray-600">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 pl-10 border-0 bg-[#f9f9f9] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-blue-500 rounded-full transition-colors"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline pointer-events-auto relative z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Forgot password clicked");
                    }}
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pl-10 border-0 bg-[#f9f9f9] focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-blue-500 rounded-full transition-colors"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="blue"
                  className="w-full h-11 font-medium shadow-sm rounded-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </Button>
              </div>

              {/* Register Link */}
              <div className="text-center pt-2 relative z-20">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline pointer-events-auto relative z-30 inline-block"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Register clicked");
                    }}
                  >
                    Register
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} ERP System. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
