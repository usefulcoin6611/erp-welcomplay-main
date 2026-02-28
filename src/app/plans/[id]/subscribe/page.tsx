"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
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
import { ArrowLeft, Check, Search, Monitor, Briefcase, Target, Users, CreditCard, Building2, X } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

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
  const [paymentMethod, setPaymentMethod] = React.useState<string>('bank-transfer')
  const [featureSearch, setFeatureSearch] = React.useState<string>('')

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
          paymentMethod: paymentMethod === 'bank-transfer' ? 'Bank Transfer' : paymentMethod === 'stripe' ? 'STRIPE' : paymentMethod === 'paypal' ? 'PayPal' : paymentMethod,
          couponCode: appliedCoupon?.code || '',
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to create subscription')
        return
      }
      toast.success(json.message || 'Subscription order created')
      router.push('/settings?tab=subscription-plan')
    } catch {
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
  const totalPrice = Math.round(priceAfterDiscount * 1.1) // Include 10% tax (Pajak 10%)

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
            {/* Header - Subscribe to Plan card with back button inside, rata kanan */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6 w-full">
                <div className="flex w-full items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg font-semibold">Subscribe to Plan</CardTitle>
                    <CardDescription>
                      Complete your subscription by providing payment information
                    </CardDescription>
                  </div>
                  <Link href="/settings?tab=subscription-plan" className="shrink-0 ml-auto">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="h-4 w-4" />
                      Kembali ke Daftar Plan
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Section */}
              <div className="lg:col-span-2 space-y-6">
                {/* Plan Details Card */}
                <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                  <CardHeader className="px-6 py-5">
                    <CardTitle className="text-lg font-semibold">Plan Details</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Users</span>
                        <span className="text-sm font-medium">{formatUsers(plan.max_users)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Storage</span>
                        <span className="text-sm font-medium">{formatStorage(plan.storage_limit)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Plan Expire Date</span>
                        <span className="text-sm font-medium">{planExpireDate}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Features Card */}
                <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                  <CardHeader className="px-6 py-5">
                    <CardTitle className="text-lg font-semibold">Available Features</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="space-y-5">
                      {/* Search Bar */}
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search features..."
                            className="pl-10"
                            value={featureSearch}
                            onChange={(e) => setFeatureSearch(e.target.value)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="default"
                          className="bg-blue-600 hover:bg-blue-700 text-white shadow-none"
                          onClick={() => {}}
                        >
                          Search
                        </Button>
                      </div>

                      {/* Features Grid - all modules; disabled look for not-included */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto">
                        {filteredFeatures.map((feature) => {
                          const enabled = feature.enabled
                          return (
                            <div
                              key={feature.key}
                              className={`flex flex-col items-center gap-2 p-3 border rounded-lg transition-colors ${
                                enabled
                                  ? 'hover:bg-muted/50 cursor-pointer border-border'
                                  : 'opacity-60 cursor-not-allowed border-border/50 bg-muted/30'
                              }`}
                            >
                              <div
                                className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                                  enabled ? 'bg-blue-100 text-blue-600' : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {feature.icon}
                              </div>
                              <span
                                className={`text-xs text-center font-medium ${
                                  enabled ? 'text-foreground' : 'text-muted-foreground'
                                }`}
                              >
                                {feature.name}
                              </span>
                              {!enabled && (
                                <span className="text-[10px] text-muted-foreground">Not included</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Section - Subscribe to Plan */}
              <div className="lg:col-span-1">
                <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                  <CardHeader className="px-6 py-5">
                    <CardTitle className="text-lg font-semibold">Subscribe to Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Plan Type Badge */}
                      <div className="flex items-center justify-center gap-6 pb-5 border-b">
                        <Badge className={`${getPlanBadgeColorsSolid(plan.name)} text-base px-4 py-2`}>
                          {plan.name}
                        </Badge>
                        {planPriceIdr > 0 && (
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold">{formatPriceIdr(planPriceIdr)}</span>
                            <span className="text-sm text-muted-foreground">/bulan</span>
                          </div>
                        )}
                      </div>

                      {/* Coupon Code */}
                      <div className="space-y-3">
                        <Label htmlFor="coupon-code">Coupon Code</Label>
                        {appliedCoupon ? (
                          <div className="flex items-center justify-between gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                {appliedCoupon.name} ({appliedCoupon.code}) – {appliedCoupon.discount}% off
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-green-700 hover:bg-green-100"
                              onClick={handleRemoveCoupon}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <Input
                              id="coupon-code"
                              placeholder="Enter coupon code"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value)
                                setCouponError(null)
                              }}
                              className={couponError ? 'border-destructive' : ''}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="shadow-none"
                              onClick={handleApplyCoupon}
                              disabled={applyLoading}
                            >
                              {applyLoading ? 'Checking...' : 'Apply'}
                            </Button>
                          </div>
                        )}
                        {couponError && (
                          <p className="text-xs text-destructive">{couponError}</p>
                        )}
                      </div>

                      {/* Price summary */}
                      {planPriceIdr > 0 && (
                        <div className="space-y-2 rounded-lg border bg-muted/30 px-4 py-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatPriceIdr(planPriceIdr)}</span>
                          </div>
                          {discountPercent > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Discount ({appliedCoupon?.code})</span>
                              <span>-{formatPriceIdr(discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tax (10%)</span>
                            <span>{formatPriceIdr(Math.round(priceAfterDiscount * 0.1))}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2 font-semibold">
                            <span>Total</span>
                            <span>{formatPriceIdr(totalPrice)}</span>
                          </div>
                        </div>
                      )}

                      {/* Plan Summary */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Check className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Users</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatUsers(plan.max_users)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Check className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Storage</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatStorage(plan.storage_limit)}
                          </span>
                        </div>
                        {plan.trial_days > 0 && (
                          <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
                            <div className="flex items-center gap-3">
                              <Check className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">Free Trial</span>
                            </div>
                            <span className="text-sm font-medium text-blue-700">
                              {plan.trial_days} days
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-4">
                        <Label>Payment Method</Label>
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                            <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                            <Label
                              htmlFor="bank-transfer"
                              className="flex-1 cursor-pointer font-normal"
                            >
                              <div>
                                <div className="font-medium">Bank Transfer</div>
                                <div className="text-xs text-muted-foreground">
                                  Pay via bank transfer
                                </div>
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                            <RadioGroupItem value="paypal" id="paypal" />
                            <Label htmlFor="paypal" className="flex-1 cursor-pointer font-normal">
                              <div className="font-medium">PayPal</div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50">
                            <RadioGroupItem value="stripe" id="stripe" />
                            <Label htmlFor="stripe" className="flex-1 cursor-pointer font-normal">
                              <div className="font-medium">Stripe</div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Subscribe Button */}
                      <Button
                        type="submit"
                        disabled={submitLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-none h-12 text-base font-semibold mt-2"
                      >
                        {submitLoading ? 'Processing...' : `Subscribe to Plan - ${totalPrice === 0 ? 'Gratis' : formatPriceIdr(totalPrice)}`}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
