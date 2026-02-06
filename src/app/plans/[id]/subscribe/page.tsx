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
import { ArrowLeft, Check, Search, Monitor, Briefcase, Calendar, FileText, Target, Users, Database, CreditCard, Building2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { PLAN_DATA } from '@/lib/plan-data'

interface Plan {
  id: string
  name: string
  price: number
  duration: string
  trial_days: number
  max_users: number
  max_customers: number
  max_vendors: number
  max_clients: number
  storage_limit: number
  account: boolean
  crm: boolean
  hrm: boolean
  project: boolean
  pos: boolean
  chatgpt: boolean
  is_active: boolean
  is_disable: boolean
}

interface Feature {
  id: string
  name: string
  icon: React.ReactNode
}

// Mock plans data
const mockPlans: Plan[] = [
  {
    id: '1',
    name: 'Free Plan',
    price: 0,
    duration: 'monthly',
    trial_days: 0,
    max_users: 5,
    max_customers: 10,
    max_vendors: 5,
    max_clients: 5,
    storage_limit: 100,
    account: true,
    crm: false,
    hrm: false,
    project: false,
    pos: false,
    chatgpt: false,
    is_active: false,
    is_disable: false,
  },
  {
    id: '2',
    name: 'Gold',
    price: 49,
    duration: 'monthly',
    trial_days: 7,
    max_users: 20,
    max_customers: 50,
    max_vendors: 20,
    max_clients: 20,
    storage_limit: 500,
    account: true,
    crm: true,
    hrm: false,
    project: true,
    pos: false,
    chatgpt: false,
    is_active: false,
    is_disable: false,
  },
  {
    id: '3',
    name: 'Silver',
    price: 99,
    duration: 'monthly',
    trial_days: 14,
    max_users: 50,
    max_customers: 100,
    max_vendors: 50,
    max_clients: 50,
    storage_limit: 1000,
    account: true,
    crm: true,
    hrm: true,
    project: true,
    pos: true,
    chatgpt: false,
    is_active: true,
    is_disable: false,
  },
  {
    id: '4',
    name: 'Platinum',
    price: 199,
    duration: 'monthly',
    trial_days: 30,
    max_users: -1,
    max_customers: -1,
    max_vendors: -1,
    max_clients: -1,
    storage_limit: -1,
    account: true,
    crm: true,
    hrm: true,
    project: true,
    pos: true,
    chatgpt: true,
    is_active: false,
    is_disable: false,
  },
]

// Mock features data
const allFeatures: Feature[] = [
  { id: '1', name: 'AI Assistant', icon: <Monitor className="h-5 w-5" /> },
  { id: '2', name: 'Accounting', icon: <Briefcase className="h-5 w-5" /> },
  { id: '3', name: 'Budget Planner', icon: <Target className="h-5 w-5" /> },
  { id: '4', name: 'Calendar', icon: <Calendar className="h-5 w-5" /> },
  { id: '5', name: 'Contract', icon: <FileText className="h-5 w-5" /> },
  { id: '6', name: 'Double Entry', icon: <FileText className="h-5 w-5" /> },
  { id: '7', name: 'Form Builder', icon: <FileText className="h-5 w-5" /> },
  { id: '8', name: 'Financial Goal', icon: <Target className="h-5 w-5" /> },
  { id: '9', name: 'HRM', icon: <Users className="h-5 w-5" /> },
  { id: '10', name: 'CRM', icon: <Briefcase className="h-5 w-5" /> },
  { id: '11', name: 'Project', icon: <FileText className="h-5 w-5" /> },
  { id: '12', name: 'POS', icon: <CreditCard className="h-5 w-5" /> },
]

interface SubscribePageProps {
  params: Promise<{ id: string }>
}

export default function SubscribePage({ params }: SubscribePageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [planId, setPlanId] = React.useState<string | null>(null)
  const [plan, setPlan] = React.useState<Plan | null>(null)
  const [couponCode, setCouponCode] = React.useState<string>('')
  const [paymentMethod, setPaymentMethod] = React.useState<string>('bank-transfer')
  const [featureSearch, setFeatureSearch] = React.useState<string>('')

  React.useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params
      const id = resolvedParams.id
      setPlanId(id)
      const foundPlan = mockPlans.find((p) => p.id === id)
      setPlan(foundPlan || null)
    }
    loadParams()
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle subscription submission
    console.log('Subscribing to plan:', planId, {
      paymentMethod,
      couponCode,
    })
    // Redirect to success page or back to subscription plan
    router.push('/settings?tab=subscription-plan')
  }

  const handleApplyCoupon = () => {
    // Handle coupon application
    console.log('Applying coupon:', couponCode)
  }

  const filteredFeatures = allFeatures.filter((feature) =>
    feature.name.toLowerCase().includes(featureSearch.toLowerCase())
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

  const planPriceIdr = PLAN_DATA.find((p) => p.name === plan.name)?.price ?? plan.price
  const totalPrice = Math.round(planPriceIdr * 1.1) // Include 10% tax (Pajak 10%)

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

                      {/* Features Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto">
                        {filteredFeatures.map((feature) => (
                          <div
                            key={feature.id}
                            className="flex flex-col items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600">
                              {feature.icon}
                            </div>
                            <span className="text-xs text-center font-medium">{feature.name}</span>
                          </div>
                        ))}
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
                        <div className="flex gap-3">
                          <Input
                            id="coupon-code"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="shadow-none"
                            onClick={handleApplyCoupon}
                          >
                            Apply
                          </Button>
                        </div>
                      </div>

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
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-none h-12 text-base font-semibold mt-2"
                      >
                        Subscribe to Plan - {planPriceIdr === 0 ? 'Gratis' : formatPriceIdr(totalPrice)}
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
