"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { getRedirectPathByRole } from "@/lib/auth-utils"

export default function LoginPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { refreshUser, isLoading: contextIsLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(false)
    setError(null)
  }, [pathname])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (!email.trim() || !password.trim()) {
        setError("Email dan password wajib diisi")
        setIsLoading(false)
        return
      }

      const { data, error: authError } = await authClient.signIn.email({
        email: email.toLowerCase().trim(),
        password,
      })

      if (authError) {
        setError(authError.message || "Email atau password salah")
        setIsLoading(false)
        return
      }

      const updatedUser = await refreshUser()
      toast.success("Login Berhasil!")
      
      if (updatedUser) {
        // Special case: Company owner without branchId should go to setup-company
        if (updatedUser.type === 'company' && !updatedUser.branchId) {
          router.push('/setup-company')
        } else {
          router.push(getRedirectPathByRole(updatedUser as any))
        }
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      })
    } catch (err) {
      toast.error("Gagal masuk dengan Google")
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6 lg:p-12 font-sans overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[1400px] flex flex-col lg:flex-row bg-white rounded-[48px] overflow-hidden border border-gray-100 relative z-10 shadow-none min-h-[800px]">
        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 sm:px-20 lg:px-24 xl:px-32 py-20 relative bg-white">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight tracking-tight">Selamat Datang!</h1>
            <p className="text-[17px] text-gray-500 font-medium">Silakan masuk ke akun Anda untuk melanjutkan.</p>
          </div>

          {/* Auth Toggle Like Tabs */}
          <div className="flex p-1 bg-gray-50 rounded-xl mb-8 w-full border border-gray-100">
            <button
              type="button"
              className="flex-1 py-2 text-sm font-bold rounded-lg transition-all bg-white text-blue-600 border border-gray-100/50"
            >
              Masuk
            </button>
            <Link
              href="/register"
              className="flex-1 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors text-center"
            >
              Daftar
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
              <p className="text-[13px] font-semibold text-red-600 leading-snug">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            <div className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email Anda"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 pl-5 pr-12 border border-gray-200 bg-white focus:border-blue-500 rounded-xl transition-all shadow-none placeholder:text-gray-400 font-medium outline-none"
                    disabled={isLoading || googleLoading}
                    autoComplete="email"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 transition-colors group-focus-within:text-blue-500" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 pl-5 pr-12 border border-gray-200 bg-white focus:border-blue-500 rounded-xl transition-all shadow-none placeholder:text-gray-400 font-medium outline-none"
                    disabled={isLoading || googleLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  className="w-5 h-5 rounded-md border-gray-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="remember" className="text-xs font-bold text-gray-400 cursor-pointer select-none">Ingat saya</Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-blue-600 transition-colors hover:text-blue-700"
              >
                Lupa Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="blue"
              className="w-full h-10 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.98] bg-blue-600 hover:bg-blue-700 shadow-none"
              disabled={isLoading || googleLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memverifikasi...
                </span>
              ) : (
                "Masuk Sekarang"
              )}
            </Button>

            {/* Divider */}
            <div className="relative py-2 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-gray-100" />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Atau</span>
              <div className="flex-1 h-[1px] bg-gray-100" />
            </div>

            {/* Social Logins */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 rounded-xl border-gray-100 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-200 transition-all font-bold text-gray-600 flex items-center justify-center gap-3 shadow-none overflow-hidden py-2.5"
                onClick={handleGoogleLogin}
                disabled={googleLoading || isLoading}
              >
                {googleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span className="text-sm">Masuk dengan Google</span>
              </Button>
            </div>
          </form>

          <p className="mt-10 text-center text-xs text-gray-400 font-medium tracking-wide">
            &copy; {new Date().getFullYear()} Welcomplay ERP Systems.
          </p>
        </div>

        {/* Right Side: Image */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-blue-900 border-l border-gray-100">
          <Image
            src="/login-bg.png"
            alt="Abstract background"
            fill
            className="object-cover opacity-90 transition-transform duration-[20s] hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-black/40" />

          {/* Glassmorphism Footer */}
          <div className="absolute bottom-10 left-0 right-0 px-10">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl text-center">
              <p className="text-white/60 text-[10px] leading-relaxed font-medium">
                &copy; {new Date().getFullYear()} Welcomplay ERP Systems. Seluruh Hak Cipta Dilindungi Undang-Undang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
