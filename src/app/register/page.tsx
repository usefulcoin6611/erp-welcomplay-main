"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Mail, Lock, User, CheckCircle2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { authHeroBase64 } from "@/components/auth-hero-base64"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email tidak valid"
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter"
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Konfirmasi password wajib diisi"
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Konfirmasi password tidak cocok"
    }

    if (!acceptedTerms) {
      newErrors.terms = "Anda harus menyetujui syarat dan ketentuan"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setErrors({})

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { data, error: authError } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        callbackURL: "/setup-company",
      })

      if (authError) {
        setError(authError.message || "Pendaftaran gagal. Silakan coba lagi.")
        toast.error(authError.message || "Pendaftaran gagal")
        return
      }

      toast.success("Pendaftaran berhasil! Mengalihkan...")
      router.push("/setup-company")
    } catch (err: any) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.")
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleRegister = async () => {
    setGoogleLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/setup-company",
      })
    } catch (err) {
      toast.error("Gagal mendaftar dengan Google")
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
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-10 sm:px-20 lg:px-24 xl:px-32 py-12 relative bg-white">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-3 leading-tight tracking-tight">Daftar Akun</h2>
            <p className="text-[17px] text-gray-500 font-medium">Mulai kelola bisnis Anda dengan ERP Welcomplay.</p>
          </div>

          {/* Auth Toggle Like Tabs */}
          <div className="flex p-1 bg-gray-50 rounded-xl mb-8 w-full border border-gray-100">
            <Link
              href="/login"
              className="flex-1 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors text-center"
            >
              Masuk
            </Link>
            <button
              type="button"
              className="flex-1 py-2 text-sm font-bold rounded-lg transition-all bg-white text-blue-600 border border-gray-100/50"
            >
              Daftar
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
              <p className="text-[13px] font-semibold text-red-600 leading-snug">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="space-y-3.5">
              {/* Name */}
              <div className="space-y-1.5">
                <div className="relative group">
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nama Lengkap"
                    value={formData.name}
                    onChange={handleChange}
                    className={`h-10 pl-5 pr-12 border border-gray-200 bg-white focus:border-blue-500 rounded-xl transition-all shadow-none placeholder:text-gray-400 outline-none font-medium ${errors.name ? 'border-red-300' : ''}`}
                    disabled={isLoading || googleLoading}
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 transition-colors group-focus-within:text-blue-500" />
                </div>
                {errors.name && <p className="text-[11px] font-bold text-red-500 ml-1">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <div className="relative group">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email Bisnis"
                    value={formData.email}
                    onChange={handleChange}
                    className={`h-10 pl-5 pr-12 border border-gray-200 bg-white focus:border-blue-500 rounded-xl transition-all shadow-none placeholder:text-gray-400 outline-none font-medium ${errors.email ? 'border-red-300' : ''}`}
                    disabled={isLoading || googleLoading}
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 transition-colors group-focus-within:text-blue-500" />
                </div>
                {errors.email && <p className="text-[11px] font-bold text-red-500 ml-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="relative group">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`h-10 pl-5 pr-12 border border-gray-200 bg-white focus:border-blue-500 rounded-xl transition-all shadow-none placeholder:text-gray-400 outline-none font-medium ${errors.password ? 'border-red-300' : ''}`}
                      disabled={isLoading || googleLoading}
                    />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 transition-colors group-focus-within:text-blue-500" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="relative group">
                    <Input
                      id="password_confirmation"
                      name="password_confirmation"
                      type="password"
                      placeholder="Konfirmasi"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className={`h-10 pl-5 pr-12 border border-gray-200 bg-white focus:border-blue-500 rounded-xl transition-all shadow-none placeholder:text-gray-400 outline-none font-medium ${errors.password_confirmation ? 'border-red-300' : ''}`}
                      disabled={isLoading || googleLoading}
                    />
                    <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 transition-colors group-focus-within:text-blue-500" />
                  </div>
                </div>
              </div>
              {(errors.password || errors.password_confirmation) && (
                <p className="text-[11px] font-bold text-red-500 ml-1">{errors.password || errors.password_confirmation}</p>
              )}
            </div>

            {/* Terms & Privacy */}
            <div className="space-y-3 py-1">
              <div className="flex items-center gap-2.5 px-1 py-1">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all shadow-none"
                />
                <Label 
                  htmlFor="terms" 
                  className="text-[11px] text-gray-500 cursor-pointer select-none font-medium"
                >
                  Saya menyetujui <button type="button" className="text-blue-600 font-bold hover:underline">Syarat & Ketentuan</button> & <button type="button" className="text-blue-600 font-bold hover:underline">Kebijakan Privasi</button>
                </Label>
              </div>
              {errors.terms && (
                <p className="text-[10px] font-bold text-red-500 ml-1 bg-red-50 px-2 py-1 rounded inline-block">
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Submit */}
            {(() => {
              const isFormValid = 
                formData.name.trim() !== "" && 
                formData.email.trim() !== "" && 
                formData.password !== "" && 
                formData.password_confirmation !== "" && 
                acceptedTerms;

              return (
                <Button
                  type="submit"
                  variant="blue"
                  className="w-full h-10 rounded-xl font-bold text-sm shadow-none transition-all hover:scale-[1.01] active:scale-[0.99] bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || googleLoading || !isFormValid}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyiapkan...
                    </span>
                  ) : (
                    "Daftar Sekarang"
                  )}
                </Button>
              );
            })()}

            {/* Divider */}
            <div className="relative py-2 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-gray-100" />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Atau</span>
              <div className="flex-1 h-[1px] bg-gray-100" />
            </div>

            {/* Social Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-10 rounded-xl border-gray-100 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-200 transition-all font-bold text-gray-600 flex items-center justify-center gap-3 shadow-none overflow-hidden"
              onClick={handleGoogleRegister}
              disabled={googleLoading || isLoading}
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
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
              <span className="text-sm">Daftar dengan Google</span>
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400 font-medium tracking-wide">
            &copy; {new Date().getFullYear()} Welcomplay ERP Systems.
          </p>
        </div>

        {/* Right Side: Elegant 3D Mockup (Light Theme) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-[#f8fafc] border-l border-gray-100 items-center justify-center p-12 overflow-hidden">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 w-full h-full opacity-40">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100 rounded-full blur-[120px]" />
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-indigo-100 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-cyan-100 rounded-full blur-[80px]" />
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

            {/* Decorative Elements (Static Pastel Squares with Custom SVG Icons) */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-blue-100/40 to-cyan-100/40 backdrop-blur-xl rounded-3xl z-20 rotate-12 shadow-sm flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500/60 -rotate-12">
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
            </div>
            <div className="absolute -bottom-8 -left-4 w-28 h-28 bg-gradient-to-br from-indigo-100/30 to-purple-100/30 backdrop-blur-xl rounded-3xl z-20 shadow-sm flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500/50">
                <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
          </div>

          {/* Glassmorphism Footer */}
          <div className="absolute bottom-10 left-0 right-0 px-10">
            <div className="bg-white border border-gray-100 py-5 px-8 rounded-full text-center max-w-md mx-auto shadow-lg backdrop-blur-md">
              <p className="text-slate-600 text-[11px] font-bold tracking-wide uppercase">
                Integrated Business Solutions
              </p>
              <p className="text-slate-400 text-[9px] mt-1 font-medium">
                Satu platform untuk semua kebutuhan operasional bisnis Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

