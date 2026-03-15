"use client"

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { getPlanBadgeColorsSolid } from '@/lib/plan-badge-colors'
import { ArrowLeft, Check, Search, Monitor, Briefcase, Target, Users, CreditCard, Building2, X, Info, ArrowRight, PartyPopper, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { PaymentInstructionView } from '@/components/payment/PaymentInstructionView'

interface Plan {
  id: string
  name: string
  price: number
  duration: string
  trial_days: number
  max_users: number
  max_customers: number
  max_venders: number
  max_clients: number
  storage_limit: number
  account: boolean
  crm: boolean
  hrm: boolean
  project: boolean
  pos: boolean
  chatgpt: boolean
  is_disable: boolean
}

// Plan module keys and their display config (synced with plan flags from API)
const PLAN_FEATURE_CONFIG: {
  key: keyof Pick<Plan, 'account' | 'crm' | 'hrm' | 'project' | 'pos' | 'chatgpt'>
  name: string
  icon: React.ReactNode
}[] = [
    { key: 'account', name: 'Account', icon: <Building2 className="h-5 w-5" /> },
    { key: 'crm', name: 'CRM', icon: <Briefcase className="h-5 w-5" /> },
    { key: 'hrm', name: 'HRM', icon: <Users className="h-5 w-5" /> },
    { key: 'project', name: 'Project', icon: <Target className="h-5 w-5" /> },
    { key: 'pos', name: 'POS', icon: <CreditCard className="h-5 w-5" /> },
    { key: 'chatgpt', name: 'ChatGPT', icon: <Monitor className="h-5 w-5" /> },
  ]

interface SubscribePageProps {
  params: Promise<{ id: string }>
}

export default function SubscribePage({ params }: SubscribePageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [planId, setPlanId] = React.useState<string | null>(null)
  const [plan, setPlan] = React.useState<Plan | null>(null)
  const [planLoading, setPlanLoading] = React.useState(true)
  const [couponCode, setCouponCode] = React.useState<string>('')
  const [appliedCoupon, setAppliedCoupon] = React.useState<{ code: string; discount: number; name: string } | null>(null)
  const [couponError, setCouponError] = React.useState<string | null>(null)
  const [applyLoading, setApplyLoading] = React.useState(false)
  const [submitLoading, setSubmitLoading] = React.useState(false)
  const [paymentMethod, setPaymentMethod] = React.useState<string>('bca')
  const [featureSearch, setFeatureSearch] = React.useState<string>('')
  const [view, setView] = React.useState<'form' | 'payment'>('form')
  const [paymentData, setPaymentData] = React.useState<any>(null)
  const [initialOrderId] = React.useState(useSearchParams().get('orderId'))
  const [orderAmount, setOrderAmount] = React.useState<number | null>(null)
  const [orderSubtotal, setOrderSubtotal] = React.useState<number | null>(null)
  const [orderTax, setOrderTax] = React.useState<number | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function loadPlan() {
      setPlanLoading(true)
      try {
        const resolvedParams = await params
        const id = resolvedParams.id
        setPlanId(id)

        const res = await fetch(`/api/plans/${id}`, { cache: 'no-store' })
        const json = await res.json()

        if (cancelled) return

        if (json.success && json.data) {
          const p = json.data
          setPlan({
            id: p.id,
            name: p.name,
            price: p.price,
            duration: p.duration,
            trial_days: p.trial_days,
            max_users: p.max_users,
            max_customers: p.max_customers,
            max_venders: p.max_venders,
            max_clients: p.max_clients,
            storage_limit: p.storage_limit,
            account: p.account,
            crm: p.crm,
            hrm: p.hrm,
            project: p.project,
            pos: p.pos,
            chatgpt: p.chatgpt,
            is_disable: p.is_disable,
          })
        } else {
          setPlan(null)
        }
      } catch {
        if (!cancelled) setPlan(null)
      } finally {
        if (!cancelled) setPlanLoading(false)
      }
    }

    loadPlan()
    return () => { cancelled = true }
  }, [params])

  // Effect to load existing order if orderId is in URL
  React.useEffect(() => {
    if (!initialOrderId) return

    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${initialOrderId}/payment-info`)
        const json = await res.json()
        if (json.success && json.data) {
          setPaymentData(json.data.paymentDetails)
          setOrderAmount(json.data.price)
          setOrderSubtotal(json.data.subtotal)
          setOrderTax(json.data.tax)
          setView('payment')
        } else {
          toast.error('Data pesanan tidak ditemukan atau sudah kadaluarsa')
        }
      } catch (err) {
        console.error('Error loading order:', err)
      }
    }
    loadOrder()
  }, [initialOrderId])

  const formatPriceIdr = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatStorage = (limit: number) => {
    if (limit === -1) return 'Unlimited'
    if (limit >= 1000) return `${(limit / 1000).toFixed(1)} GB`
    return `${limit} MB`
  }

  const formatUsers = (users: number) => {
    if (users === -1) return 'Unlimited'
    return `${users} users`
  }

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase()
    if (!code) {
      setCouponError('Enter a coupon code')
      return
    }
    setCouponError(null)
    setApplyLoading(true)
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}`, { cache: 'no-store' })
      const json = await res.json()
      if (!json.success) {
        setCouponError(json.message || 'Failed to validate coupon')
        setAppliedCoupon(null)
        return
      }
      if (!json.valid) {
        setCouponError(json.message || 'Invalid coupon')
        setAppliedCoupon(null)
        return
      }
      setAppliedCoupon({ code: json.code, discount: json.discount, name: json.name || code })
      toast.success(json.message || 'Coupon applied')
    } catch {
      setCouponError('Failed to validate coupon')
      setAppliedCoupon(null)
    } finally {
      setApplyLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponError(null)
    setCouponCode('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!plan || !planId) return
    setSubmitLoading(true)
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          paymentMethod: paymentMethod.toUpperCase(),
          couponCode: appliedCoupon?.code || '',
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to create subscription')
        return
      }

      if (json.data?.midtransResponse) {
        setPaymentData(json.data.midtransResponse)
        setOrderAmount(json.data.price)
        setOrderSubtotal(json.data.subtotal)
        setOrderTax(json.data.tax)
        setView('payment')
        toast.success('Pesanan dibuat. Silakan ikuti instruksi pembayaran.')
      } else if (json.data?.paymentStatus === 'success') {
        toast.success(json.message || 'Subscription activated successfully')
        router.push('/settings?tab=subscription-plan')
      } else {
        toast.success(json.message || 'Subscription order created')
        router.push('/settings?tab=subscription-plan')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to create subscription')
    } finally {
      setSubmitLoading(false)
    }
  }

  // All plan features with enabled flag (show all; disabled look for not-included)
  const allFeaturesWithStatus = plan
    ? PLAN_FEATURE_CONFIG.map((config) => ({
      ...config,
      enabled: plan[config.key],
    }))
    : []
  const filteredFeatures = allFeaturesWithStatus.filter((f) =>
    f.name.toLowerCase().includes(featureSearch.toLowerCase())
  )

  // Calculate plan expire date (30 days from now for trial, or 1 year for regular)
  const planExpireDate = plan
    ? plan.trial_days > 0
      ? new Date(Date.now() + plan.trial_days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    : ''

  if (planLoading) {
    return (
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-3 text-muted-foreground">
                    <div className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    <p>Loading plan...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </MainContentWrapper>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  if (!plan) {
    return (
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
              <Card>
                <CardContent className="p-6">
                  <p>Plan not found</p>
                  <Link href="/settings?tab=subscription-plan">
                    <Button variant="outline" className="mt-4">
                      Back to Plans
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </MainContentWrapper>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  const planPriceIdr = plan.price
  const discountPercent = appliedCoupon?.discount ?? 0
  const discountAmount = Math.round(planPriceIdr * (discountPercent / 100))
  const priceAfterDiscount = Math.max(0, planPriceIdr - discountAmount)
  const totalPrice = Math.round(priceAfterDiscount * 1.11) // Include 11% tax (Pajak 11%)

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            <div className="flex items-center justify-between px-1">
              <Link href="/settings?tab=subscription-plan">
                <Button variant="ghost" size="sm" className="gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold px-0">
                  <ArrowLeft className="h-4 w-4" />
                  Kembali ke Daftar Paket
                </Button>
              </Link>
            </div>

            {view === 'form' ? (
              <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3 animate-in fade-in duration-500">
                {/* Left Section - Main Options */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Payment Method Selection - Now on the left per user request */}
                  <Card className="border-slate-200 bg-white">
                    <CardHeader className="px-6 py-5 border-b border-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold text-slate-800">Metode Pembayaran</CardTitle>
                          <CardDescription>Pilih cara pembayaran yang paling nyaman untuk Anda</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 py-6">
                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        className="space-y-6"
                      >
                        {/* Virtual Account Group */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Virtual Account</p>
                            <div className="h-[1px] flex-1 bg-slate-100" />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { id: 'bca', name: 'BCA', img: '/payment/bca.svg' },
                              { id: 'mandiri', name: 'Mandiri', img: '/payment/mandiri.svg' },
                              { id: 'bni', name: 'BNI', img: '/payment/bni.svg' },
                              { id: 'bri', name: 'BRI', img: '/payment/bri.svg' },
                              { id: 'bsi', name: 'BSI', img: '/payment/bsi.svg' },
                              { id: 'permata', name: 'Permata', img: '/payment/permata.svg' },
                              { id: 'cimb', name: 'CIMB Niaga', img: '/payment/cimbniaga.svg' },
                              { id: 'danamon', name: 'Danamon', img: '/payment/danamon.svg' },
                              { id: 'seabank', name: 'SeaBank', img: '/payment/seabank.svg' },
                            ].map((bank) => (
                              <div key={bank.id} className="relative">
                                <RadioGroupItem value={bank.id} id={bank.id} className="peer sr-only" />
                                <Label
                                  htmlFor={bank.id}
                                  className="flex flex-col items-center justify-center gap-2 p-4 border rounded-2xl cursor-pointer transition-all h-[90px] border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50/50 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-blue-500 shadow-none hover:shadow-sm"
                                >
                                  <div className="w-12 h-6 flex items-center justify-center">
                                    <img src={bank.img} alt={bank.name} className="h-full object-contain" />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500 peer-data-[state=checked]:text-blue-600 uppercase tracking-tight">{bank.name}</span>
                                </Label>
                                <div className="hidden peer-data-[state=checked]:flex absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-blue-600 items-center justify-center shadow-md animate-in zoom-in duration-200 pointer-events-none border-2 border-white">
                                  <Check className="w-3 h-3 text-white" strokeWidth={4} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* E-Wallet & QRIS Group */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">E-Wallet & QRIS</p>
                            <div className="h-[1px] flex-1 bg-slate-100" />
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { id: 'gopay', name: 'GoPay', img: '/payment/gopay.svg' },
                              { id: 'dana', name: 'DANA', img: '/payment/dana.svg' },
                              { id: 'qris', name: 'QRIS', img: '/payment/qris.svg' },
                            ].map((item) => (
                              <div key={item.id} className="relative">
                                <RadioGroupItem value={item.id} id={item.id} className="peer sr-only" />
                                <Label
                                  htmlFor={item.id}
                                  className="flex flex-col items-center justify-center gap-2 p-4 border rounded-2xl cursor-pointer transition-all h-[90px] border-slate-100 bg-white hover:border-blue-200 hover:bg-slate-50/50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50/50 peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-blue-500 shadow-none hover:shadow-sm"
                                >
                                  <div className="w-12 h-6 flex items-center justify-center">
                                    <img src={item.img} alt={item.name} className="h-full object-contain" />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500 peer-data-[state=checked]:text-blue-600 uppercase tracking-tight">{item.name}</span>
                                </Label>
                                <div className="hidden peer-data-[state=checked]:flex absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-blue-600 items-center justify-center shadow-md animate-in zoom-in duration-200 pointer-events-none border-2 border-white">
                                  <Check className="w-3 h-3 text-white" strokeWidth={4} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </RadioGroup>

                      {/* Powered by Midtrans - Bottom */}
                      <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-center gap-2">
                        <span className="text-[10px] font-medium text-slate-400">Secure Payment Powered by</span>
                        <img src="/logo/midtrans-logo.svg" alt="Midtrans" className="h-3" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Section - Subscribe to Plan / Order Summary */}
                <div className="lg:col-span-1 space-y-6">
                  <Card className="shadow-none border-slate-200 sticky top-24">
                    <CardHeader className="px-6 pt-6 pb-2">
                      <CardTitle className="text-lg font-bold text-slate-800">Order Summary</CardTitle>
                      <CardDescription className="text-[11px]">Rincian paket dan biaya langganan</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pt-0 pb-6 space-y-4">
                      {/* Selected Plan Info - Consolidated here */}
                      <div className="p-4 bg-blue-50 rounded-2xl text-blue-900 relative overflow-hidden mb-2">
                        <Check className="w-16 h-16 absolute -bottom-4 -right-4 text-blue-100/50 rotate-12" />
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Paket Pilihan</p>
                        <div className="flex items-center justify-between gap-3 relative z-10">
                          <h3 className="text-xl font-black tracking-tight">{plan.name}</h3>
                          <div className="flex items-baseline gap-1 bg-white px-2 py-1 rounded-lg">
                            <span className="text-sm font-black text-blue-700">{formatPriceIdr(planPriceIdr)}</span>
                            <span className="text-[8px] font-bold text-blue-400 uppercase">/ Bln</span>
                          </div>
                        </div>
                      </div>
                      {/* Available Features - Moved here per user request */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Included Features</p>
                          <Badge variant="outline" className="text-[9px] font-bold text-blue-600 bg-blue-50 border-blue-100">Premium</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 pr-1">
                          {filteredFeatures.map((feature) => (
                            <div
                              key={feature.key}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${feature.enabled
                                ? 'border-blue-100 bg-blue-50/40 text-blue-900 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                                : 'border-slate-50 bg-slate-50/30 opacity-30 grayscale'
                                }`}
                            >
                              <div className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${feature.enabled ? 'bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-blue-600' : 'bg-slate-100 text-slate-400'
                                }`}>
                                {React.cloneElement(feature.icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
                              </div>
                              <span className="text-[10px] font-bold leading-tight truncate">
                                {feature.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="h-[1px] bg-slate-100" />

                      {/* Plan Limits Summary */}
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Maksimal Pengguna</span>
                          <span className="text-slate-800 font-bold">{formatUsers(plan.max_users)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Kapasitas Penyimpanan</span>
                          <span className="text-slate-800 font-bold">{formatStorage(plan.storage_limit)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-medium">Masa Berlaku</span>
                          <span className="text-slate-800 font-bold">1 Tahun</span>
                        </div>
                      </div>

                      <div className="h-[1px] bg-slate-100" />

                      {/* Coupon Code */}
                      <div className="space-y-3">
                        <Label htmlFor="coupon-code" className="text-xs font-bold text-slate-600">Kode Kupon</Label>
                        {appliedCoupon ? (
                          <div className="flex items-center justify-between gap-2 rounded-xl border border-green-200 bg-green-50/50 px-3 py-2 animate-in slide-in-from-top-1">
                            <div className="flex items-center gap-2">
                              <PartyPopper className="h-4 w-4 text-green-600" />
                              <span className="text-[11px] font-bold text-green-800">
                                {appliedCoupon.name} (-{appliedCoupon.discount}%)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-green-700 hover:bg-green-100 rounded-full"
                              onClick={handleRemoveCoupon}
                            >
                              <X className="h-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Input
                              id="coupon-code"
                              placeholder="Punya kupon?"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value)
                                setCouponError(null)
                              }}
                              className={`h-9 text-xs rounded-xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-blue-500/20 ${couponError ? 'border-destructive' : ''}`}
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              className="h-9 px-4 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                              onClick={handleApplyCoupon}
                              disabled={applyLoading}
                            >
                              {applyLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                            </Button>
                          </div>
                        )}
                        {couponError && (
                          <p className="text-[10px] font-bold text-destructive pl-1 uppercase tracking-tight">{couponError}</p>
                        )}
                      </div>

                      {/* Price summary */}
                      <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Harga Paket</span>
                          <span className="text-slate-800 font-medium">{formatPriceIdr(planPriceIdr)}</span>
                        </div>
                        {discountPercent > 0 && (
                          <div className="flex justify-between text-xs text-green-600 font-medium">
                            <span>Diskon ({appliedCoupon?.code})</span>
                            <span>-{formatPriceIdr(discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Pajak (11%)</span>
                          <span className="text-slate-800 font-medium">{formatPriceIdr(Math.round(priceAfterDiscount * 0.11))}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200">
                          <span className="text-sm font-bold text-slate-900">Total Pembayaran</span>
                          <span className="text-lg font-black text-blue-700 leading-none">
                            {totalPrice === 0 ? 'Gratis' : formatPriceIdr(totalPrice)}
                          </span>
                        </div>
                      </div>

                      {/* Subscribe Button */}
                      <Button
                        type="submit"
                        disabled={submitLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-base font-black rounded-2xl transition-all active:scale-[0.98] group"
                      >
                        {submitLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Memproses...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <span>Konfirmasi Pembayaran</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </Button>

                      <p className="text-[10px] text-center text-slate-400 font-medium px-4 leading-relaxed">
                        Dengan melanjutkan, Anda menyetujui <span className="text-blue-500 underline cursor-pointer">Syarat & Ketentuan</span> yang berlaku.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </form>
            ) : (
              <PaymentInstructionView
                paymentData={paymentData}
                planName={plan.name}
                amount={orderAmount || totalPrice}
                subtotal={orderSubtotal || priceAfterDiscount}
                tax={orderTax || Math.round(priceAfterDiscount * 0.11)}
                onBack={() => setView('form')}
              />
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
