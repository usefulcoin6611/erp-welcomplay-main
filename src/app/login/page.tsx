"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { getRedirectPathByRole } from "@/lib/auth-utils"
import { authHeroBase64 } from "@/components/auth-hero-base64"

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
  const [resendLoading, setResendLoading] = useState(false)
  const [isUnverified, setIsUnverified] = useState(false)

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
        if (authError.code === "EMAIL_NOT_VERIFIED") {
          setIsUnverified(true)
          setError("Email Anda belum diaktifkan. Silakan cek inbox Anda.")
        } else {
          setError(authError.message || "Email atau password salah")
        }
        setIsLoading(false)
        return
      }

      const updatedUser = await refreshUser()
      toast.success("Login Berhasil!")
      
      if (updatedUser) {
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

  const handleResendVerification = async () => {
    if (!email) return
    setResendLoading(true)
    try {
      await authClient.sendVerificationEmail({
        email: email.toLowerCase().trim(),
        callbackURL: "/setup-company",
      })
      toast.success("Email aktivasi telah dikirim ulang!")
    } catch (err) {
      toast.error("Gagal mengirim ulang email aktivasi")
    } finally {
      setResendLoading(false)
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 md:p-8 lg:p-12 font-sans overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[1400px] flex flex-col lg:flex-row bg-white rounded-3xl sm:rounded-[48px] overflow-hidden border border-gray-100 relative z-10 shadow-none min-h-[auto] lg:min-h-[800px]">
        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-12 relative bg-white">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight tracking-tight">Selamat Datang!</h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">Silakan masuk ke akun Anda untuk melanjutkan.</p>
          </div>

          {/* Auth Toggle Like Tabs */}
          <div className="flex p-1 bg-gray-50 rounded-xl mb-6 w-full border border-gray-100">
            <button
              type="button"
              className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all bg-white text-blue-600 border border-gray-100/50"
            >
              Masuk
            </button>
            <Link
              href="/register"
              className="flex-1 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors text-center"
            >
              Daftar
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 border ${isUnverified ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {isUnverified ? <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" /> : <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 animate-pulse shrink-0" />}
              <div className="space-y-2 flex-1">
                <p className="text-[13px] font-bold leading-snug">{error}</p>
                {isUnverified && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="text-xs font-bold text-amber-900 underline hover:no-underline flex items-center gap-2"
                  >
                    {resendLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Kirim Ulang Email Aktivasi"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 w-full">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-gray-700 ml-1">Email Bisnis</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-900 font-medium text-sm"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || googleLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-bold text-gray-700 ml-1">Password</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-11 pr-12 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-900 font-medium text-sm"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || googleLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                  className="rounded-md border-gray-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="remember" className="text-[13px] font-medium text-gray-500 cursor-pointer select-none">Ingat saya</Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-[13px] font-bold text-blue-600 transition-colors hover:text-blue-700"
              >
                Lupa Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading || googleLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 h-auto rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Memproses...
                </>
              ) : (
                "Masuk Sekarang"
              )}
            </Button>

            <div className="relative py-4 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-gray-100" />
              <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Atau</span>
              <div className="flex-1 h-[1px] bg-gray-100" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 rounded-xl border border-gray-100 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-none text-sm cursor-pointer"
            >
              {googleLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
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
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 text-sm font-medium">
            Belum punya akun?{" "}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              Daftar Gratis
            </Link>
          </p>
        </div>

        {/* Right Side: Elegant 3D Mockup (Light Theme) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#f8fafc] border-l border-gray-100 items-center justify-center p-12 overflow-hidden">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 w-full h-full opacity-40">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px]" />
            <div className="absolute top-1/4 right-0 w-80 h-80 bg-indigo-100 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-cyan-100 rounded-full blur-[80px]" />
          </div>

          <div 
            className="relative w-full aspect-square max-w-[550px]"
            style={{ perspective: '2000px' }}
          >
            <div 
              className="w-full h-full relative"
              style={{
                transform: 'rotateY(-25deg) rotateX(15deg) skew(-5deg)',
                transformStyle: 'preserve-3d',
                boxShadow: '-20px 40px 80px -10px rgba(0,0,0,0.1), 0 5px 20px -5px rgba(59,130,246,0.1)',
                borderRadius: '32px',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}
            >
              <Image
                src={authHeroBase64}
                alt="Welcomplay ERP Premium Dashboard"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-white/10 pointer-events-none" />
            </div>
          </div>

          {/* Footer Label */}
          <div className="absolute bottom-10 left-0 right-0 px-10">
            <div className="bg-slate-100/80 py-5 px-8 rounded-full text-center max-w-md mx-auto backdrop-blur-md">
              <p className="text-slate-700 text-[11px] font-bold tracking-wide uppercase">
                Enterprise Resource Planning
              </p>
              <p className="text-slate-500 text-[9px] mt-1 font-medium">
                Sistem Terpadu Efisiensi Bisnis Anda dalam Satu Genggaman.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
