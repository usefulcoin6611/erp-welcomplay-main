"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Mail, Lock, User, CheckCircle2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { authHeroBase64 } from "@/components/auth-hero-base64"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })

  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    password_confirmation?: string
    terms?: string
  }>({})

  const validateForm = () => {
    const newErrors: any = {}
    if (!formData.name.trim()) newErrors.name = "Nama lengkap wajib diisi"
    if (!formData.email) {
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
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        name: formData.name.trim(),
        callbackURL: "/setup-company",
      })

      if (authError) {
        setError(authError.message || "Pendaftaran gagal. Silakan coba lagi.")
        toast.error(authError.message || "Pendaftaran gagal")
        return
      }

      toast.success("Pendaftaran berhasil! Silakan cek email Anda untuk aktivasi.")
      setIsSuccess(true)
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 md:p-8 lg:p-12 font-sans overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[1400px] flex flex-col lg:flex-row bg-white rounded-3xl sm:rounded-[48px] overflow-hidden border border-gray-100 relative z-10 shadow-none min-h-[auto] lg:min-h-[800px]">
        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-12 relative bg-white">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Cek Email Anda</h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">
                Kami telah mengirimkan link aktivasi ke <strong>{formData.email}</strong>. 
                Silakan klik link tersebut untuk mengaktifkan akun Anda.
              </p>
              <Button 
                onClick={() => router.push("/login")}
                className="w-full py-4 h-auto rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Kembali ke Login
              </Button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight tracking-tight">Daftar Akun</h1>
                <p className="text-sm sm:text-base text-gray-500 font-medium">Mulai kelola bisnis Anda dengan ERP Welcomplay.</p>
              </div>

              {/* Auth Toggle Like Tabs */}
              <div className="flex p-1 bg-gray-50 rounded-xl mb-6 w-full border border-gray-100">
                <Link
                  href="/login"
                  className="flex-1 py-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors text-center"
                >
                  Masuk
                </Link>
                <button
                  type="button"
                  className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all bg-white text-blue-600 border border-gray-100/50"
                >
                  Daftar
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 w-full">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-gray-700 ml-1">Nama Lengkap</Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        required
                        className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${errors.name ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-900 font-medium text-sm`}
                        placeholder="Masukkan nama lengkap"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={isLoading || googleLoading}
                      />
                    </div>
                    {errors.name && <p className="text-xs font-bold text-red-500 ml-1 mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full" /> {errors.name}
                    </p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-bold text-gray-700 ml-1">Email Bisnis</Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        required
                        className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${errors.email ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-900 font-medium text-sm`}
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={isLoading || googleLoading}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && <p className="text-xs font-bold text-red-500 ml-1 mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full" /> {errors.email}
                    </p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-bold text-gray-700 ml-1">Password</Label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                          <Lock size={18} />
                        </div>
                        <input
                          type="password"
                          required
                          className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${errors.password ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-900 font-medium text-sm`}
                          placeholder="Min 8 karakter"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          disabled={isLoading || googleLoading}
                          autoComplete="new-password"
                        />
                      </div>
                      {errors.password && <p className="text-xs font-bold text-red-500 ml-1 mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full" /> {errors.password}
                      </p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-bold text-gray-700 ml-1">Konfirmasi</Label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                          <Lock size={18} />
                        </div>
                        <input
                          type="password"
                          required
                          className={`w-full pl-11 pr-4 py-2.5 bg-gray-50 border ${errors.password_confirmation ? 'border-red-300' : 'border-gray-100'} rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white transition-all outline-none text-gray-900 font-medium text-sm`}
                          placeholder="Ulangi password"
                          value={formData.password_confirmation}
                          onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                          disabled={isLoading || googleLoading}
                          autoComplete="new-password"
                        />
                      </div>
                      {errors.password_confirmation && <p className="text-xs font-bold text-red-500 ml-1 mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full" /> {errors.password_confirmation}
                      </p>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 py-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                      className="rounded-md border-gray-200 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <Label
                      htmlFor="terms"
                      className="text-[13px] text-gray-500 leading-none cursor-pointer font-medium"
                    >
                      Saya menyetujui <Link href="/terms" className="text-blue-600 font-bold hover:underline">Syarat & Ketentuan</Link> serta <Link href="/privacy" className="text-blue-600 font-bold hover:underline">Kebijakan Privasi</Link>
                    </Label>
                  </div>
                  {errors.terms && <p className="text-xs font-bold text-red-500 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full" /> {errors.terms}
                  </p>}
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center gap-2 border border-red-100">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    {error}
                  </div>
                )}

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
                    "Buat Akun Sekarang"
                  )}
                </Button>

                <div className="relative py-4 flex items-center gap-4">
                  <div className="flex-1 h-[1px] bg-gray-100" />
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Atau</span>
                  <div className="flex-1 h-[1px] bg-gray-100" />
                </div>

                <button
                  type="button"
                  onClick={handleGoogleRegister}
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
                Sudah punya akun?{" "}
                <Link href="/login" className="text-blue-600 font-bold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </>
          )}
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
                Integrated Business Solutions
              </p>
              <p className="text-slate-500 text-[9px] mt-1 font-medium">
                Satu platform untuk semua kebutuhan operasional bisnis Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
