"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Check, X } from 'lucide-react'

// Plan-specific styling (matches /plans page)
function getPlanCardStyle(name: string) {
  const n = name.toLowerCase()
  if (n.includes('platinum')) {
    return {
      card: 'bg-gradient-to-b from-purple-50/80 to-white',
      price: 'text-purple-600',
      badge: 'bg-purple-100 text-purple-700',
      limitsBg: 'bg-purple-50/60',
    }
  }
  if (n.includes('gold')) {
    return {
      card: 'bg-gradient-to-b from-amber-50/80 to-white',
      price: 'text-amber-600',
      badge: 'bg-amber-100 text-amber-700',
      limitsBg: 'bg-amber-50/60',
    }
  }
  if (n.includes('silver')) {
    return {
      card: 'bg-gradient-to-b from-blue-50/80 to-white',
      price: 'text-blue-600',
      badge: 'bg-blue-100 text-blue-700',
      limitsBg: 'bg-blue-50/60',
    }
  }
  return {
    card: 'bg-gradient-to-b from-zinc-50 to-white',
    price: 'text-zinc-600',
    badge: 'bg-zinc-100 text-zinc-700',
    limitsBg: 'bg-zinc-100/80',
  }
}

const modules = [
  { key: 'account', label: 'Account' },
  { key: 'crm', label: 'CRM' },
  { key: 'hrm', label: 'HRM' },
  { key: 'project', label: 'Project' },
  { key: 'pos', label: 'POS' },
  { key: 'chatgpt', label: 'ChatGPT' },
]

type PlanFromApi = {
  id: string
  name: string
  price: number
  duration: 'lifetime' | 'month' | 'year'
  max_users: number
  max_customers: number
  max_venders: number
  max_clients: number
  storage_limit: number
  trial_days: number
  is_disable: boolean
  account: boolean
  crm: boolean
  hrm: boolean
  project: boolean
  pos: boolean
  chatgpt: boolean
}

export function SubscriptionPlanTab() {
  const router = useRouter()
  const [plans, setPlans] = useState<PlanFromApi[]>([])
  const [currentPlanName, setCurrentPlanName] = useState<string | null>(null)
  const [currentPlanExpireDate, setCurrentPlanExpireDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [plansRes, currentRes] = await Promise.all([
          fetch('/api/plans', { cache: 'no-store' }),
          fetch('/api/settings/current-plan', { cache: 'no-store' }),
        ])

        if (cancelled) return

        const plansJson = await plansRes.json()
        const currentJson = await currentRes.json()

        if (!plansJson.success || !Array.isArray(plansJson.data)) {
          setError(plansJson.message ?? 'Failed to load plans')
          return
        }

        setPlans(plansJson.data as PlanFromApi[])
        if (currentJson.success && currentJson.data != null) {
          if (currentJson.data.plan != null) setCurrentPlanName(currentJson.data.plan as string)
          if (currentJson.data.planExpireDate != null) setCurrentPlanExpireDate(currentJson.data.planExpireDate as string)
        }
      } catch {
        if (!cancelled) setError('Failed to load subscription data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const handleSubscribe = (planId: string) => {
    if (!planId) return
    router.push(`/plans/${planId}/subscribe`)
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }
  const formatLimit = (limit: number) => (limit === -1 ? 'Unlimited' : limit.toString())
  const formatStorage = (limit: number) => {
    if (limit === -1) return 'Unlimited'
    if (limit >= 1000) return `${(limit / 1000).toFixed(0)} GB`
    return `${limit} MB`
  }
  const getDurationLabel = (duration: string) => {
    if (duration === 'month') return 'Per Month'
    if (duration === 'year') return 'Per Year'
    if (duration === 'lifetime') return 'Lifetime'
    return duration
  }

  // Only show plans that super admin has enabled (not disabled)
  const enabledPlans = plans.filter((p) => !p.is_disable)

  return (
    <div className="space-y-4">
      {!loading && !error && currentPlanName != null && (
        <div className="rounded-2xl overflow-hidden bg-white p-5 border border-border/50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-0.5">Current plan</p>
              <p className={`text-xl font-bold ${getPlanCardStyle(currentPlanName).price}`}>{currentPlanName}</p>
              {currentPlanExpireDate && (
                <p className="text-sm text-slate-600 mt-1">
                  Expires: {new Date(currentPlanExpireDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white p-6 border border-border/50">
                <Skeleton className="h-5 w-20 mb-4" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-16 mb-5" />
                <div className="rounded-xl bg-muted/50 px-4 py-3 space-y-2 mb-5">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mb-5">
                  <Skeleton className="h-6 w-16 rounded-lg" />
                  <Skeleton className="h-6 w-12 rounded-lg" />
                  <Skeleton className="h-6 w-14 rounded-lg" />
                </div>
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-6 py-8 text-center text-muted-foreground">
          {error}
        </div>
      )}

      {!loading && !error && enabledPlans.length === 0 && (
        <div className="rounded-lg border border-border bg-muted/30 px-6 py-12 text-center text-muted-foreground">
          No subscription plans are available at the moment. Please check back later.
        </div>
      )}

      {!loading && !error && enabledPlans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {enabledPlans.map((plan) => {
              const isCurrentPlan = currentPlanName != null && plan.name === currentPlanName
              const style = getPlanCardStyle(plan.name)
              return (
                <div
                  key={plan.id}
                  className={`group relative flex flex-col h-full ${style.card} rounded-2xl overflow-hidden`}
                >
                  <div className="flex flex-col flex-1 p-6">
                    {/* Plan name pill + Active indicator */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
                        {plan.name}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-5">
                      <div className={`text-3xl font-bold ${style.price}`}>
                        {formatPrice(plan.price)}
                      </div>
                      <div className="text-sm text-slate-500 mt-1 font-medium">
                        {plan.price === 0 ? 'See what we can do' : getDurationLabel(plan.duration)}
                      </div>
                      {plan.trial_days > 0 && (
                        <div className="text-xs font-semibold text-slate-600 mt-2">
                          {plan.trial_days} days trial
                        </div>
                      )}
                    </div>

                    {/* Limits - with plan-specific tint */}
                    <div className={`${style.limitsBg} rounded-xl px-4 py-3 space-y-2 mb-5`}>
                      {[
                        { label: 'Users', value: formatLimit(plan.max_users) },
                        { label: 'Customers', value: formatLimit(plan.max_customers) },
                        { label: 'Vendors', value: formatLimit(plan.max_venders) },
                        { label: 'Clients', value: formatLimit(plan.max_clients) },
                        { label: 'Storage', value: formatStorage(plan.storage_limit) },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between text-sm">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="font-semibold text-slate-800">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Modules */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {modules.map((mod) => {
                        const enabled = plan[mod.key as keyof PlanFromApi] as boolean
                        return (
                          <span
                            key={mod.key}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${enabled ? style.badge : 'text-slate-400 bg-slate-100'}`}
                          >
                            {enabled ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={2} />}
                            {mod.label}
                          </span>
                        )
                      })}
                    </div>

                    {/* Action */}
                    <div className="pt-4 mt-auto">
                      {isCurrentPlan ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-9 text-xs font-semibold rounded-xl bg-green-50 text-green-700 border-green-100"
                          disabled
                        >
                          <Check className="h-3 w-3 mr-1" /> Current Plan
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="blue"
                          className="w-full h-9 text-xs font-semibold rounded-xl shadow-none"
                          onClick={() => handleSubscribe(plan.id)}
                        >
                          Berlangganan
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
      )}
    </div>
  )
}
