"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Building2, Globe, MapPin, Phone, ArrowRight, Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"
import { hasActivePlan } from "@/lib/permission-utils"

export default function SetupCompanyPage() {
  const router = useRouter()
  const { user, isLoading, refreshUser } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    address: "",
    phone: "",
    website: "",
    industry: "",
  })

  // Redirect if already has branchId
  React.useEffect(() => {
    if (!isLoading && user && user.type === 'company' && user.branchId) {
      const redirectPath = hasActivePlan(user as any)
        ? '/hrm-dashboard'
        : '/settings?tab=subscription-plan'
      router.replace(redirectPath)
    }
  }, [user, isLoading, router])

  if (isLoading || (user?.branchId && user?.type === 'company')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const nextStep = () => {
    if (step === 1 && !formData.companyName) {
      toast.error("Nama perusahaan wajib diisi")
      return
    }
    setStep(step + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/setup-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message || "Gagal menyimpan profil")
      }

      toast.success("Profil perusahaan berhasil disimpan!")
      
      // Force refresh user context to get new branchId
      const updatedUser = await refreshUser()
      
      if (updatedUser) {
        // Redirection logic is now more consistent with auth-wrapper
        const { getRedirectPathByRole } = await import("@/lib/auth-utils")
        const redirectPath = getRedirectPathByRole(updatedUser as any)
        router.push(redirectPath)
      } else {
        router.push("/settings?tab=subscription-plan")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan profil")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none" />
      
      <main className="flex-1 flex items-center justify-center relative z-10 px-4 py-12">
        <div className="w-full max-w-[550px]">
          <div className="bg-white rounded-[28px] p-10 border border-gray-100 shadow-none">
            {/* Progress Stepper */}
            <div className="flex items-center gap-3 mb-10">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-blue-600' : 'bg-gray-100'}`}
                />
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-left">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Identitas Bisnis</h2>
                  <p className="text-[15px] text-gray-500 font-medium">Berikan informasi dasar tentang perusahaan Anda.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-gray-700 ml-1">Nama Perusahaan</Label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-blue-500" />
                      <Input 
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Contoh: PT. Maju Bersama" 
                        className="h-10 pl-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 shadow-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-gray-700 ml-1">Alamat Kantor</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-blue-500" />
                      <Input 
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Alamat lengkap perusahaan" 
                        className="h-10 pl-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 shadow-none"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={nextStep}
                  variant="blue"
                  className="w-full h-10 rounded-xl font-bold text-sm bg-blue-600 gap-2"
                >
                  Lanjut ke Kontak <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-left">
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Kontak & Kehadiran</h2>
                  <p className="text-[15px] text-gray-500 font-medium">Bagaimana klien dapat menghubungi bisnis Anda?</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-gray-700 ml-1">Nomor Telepon</Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-blue-500" />
                      <Input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+62 812..." 
                        className="h-10 pl-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 shadow-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-bold text-gray-700 ml-1">Website (Opsional)</Label>
                    <div className="relative group">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400 group-focus-within:text-blue-500" />
                      <Input 
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="www.perusahaananda.com" 
                        className="h-10 pl-12 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white focus:border-blue-500 shadow-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1 h-10 rounded-xl font-bold text-sm border-gray-100"
                  >
                    Kembali
                  </Button>
                  <Button 
                    onClick={nextStep}
                    variant="blue"
                    className="flex-[2] h-10 rounded-xl font-bold text-sm bg-blue-600 gap-2"
                  >
                    Langkah Terakhir <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Hampir Selesai!</h2>
                  <p className="text-[14px] text-gray-500 font-medium">Data perusahaan siap diproses. Anda akan diarahkan untuk memilih paket langganan.</p>
                </div>

                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Nama Bisnis</span>
                    <span className="font-bold text-gray-900 text-sm">{formData.companyName}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-2">
                    <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Lokasi</span>
                    <span className="font-bold text-gray-900 text-sm">{formData.address || '-'}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  variant="blue"
                  className="w-full h-10 rounded-xl font-bold text-sm bg-blue-600 shadow-lg shadow-blue-200"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Selesaikan Setup & Lihat Paket
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

