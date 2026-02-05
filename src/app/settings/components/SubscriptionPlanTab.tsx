"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPlanBadgeColorsSolid } from '@/lib/plan-badge-colors'
import { Check, CirclePlus, CircleMinus } from 'lucide-react'

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

export function SubscriptionPlanTab() {
  const router = useRouter()
  const [plans] = useState<Plan[]>(mockPlans)
  const currentPlanId =
    plans.find((plan) => plan.is_active)?.id ?? plans[0]?.id

  const handleSubscribe = (planId: string) => {
    router.push(`/plans/${planId}/subscribe`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price)
  }

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'monthly':
        return 'Monthly'
      case 'annual':
        return 'Annual'
      case 'lifetime':
        return 'Lifetime'
      default:
        return duration
    }
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
        <CardHeader className="px-6">
          <CardTitle className="text-lg font-semibold">Subscription Plan</CardTitle>
          <CardDescription>
            Pilih paket berlangganan yang sesuai kebutuhan perusahaan.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId
          return (
            <Card key={plan.id} className="shadow-none relative">
              <Badge className={`absolute top-4 right-4 ${getPlanBadgeColorsSolid(plan.name)}`}>
                {plan.name}
              </Badge>
              {isCurrentPlan && (
                <div className="absolute top-4 left-4">
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-medium">Active</span>
                  </div>
                </div>
              )}
              <CardContent className="p-6">
                <div className="text-center mb-4 mt-4">
                  <h1 className="text-3xl font-bold mb-2">
                    {plan.price === 0 ? 'Free' : `$${formatPrice(plan.price)}`}
                    <small className="text-sm font-normal text-muted-foreground">
                      /{getDurationLabel(plan.duration)}
                    </small>
                  </h1>
                  <p className="text-sm text-muted-foreground mb-1">
                    Free Trial Days: {plan.trial_days}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CirclePlus className="h-4 w-4 text-primary" />
                      <span>
                        {plan.max_users === -1 ? 'Unlimited' : plan.max_users} Users
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CirclePlus className="h-4 w-4 text-primary" />
                      <span>
                        {plan.max_customers === -1 ? 'Unlimited' : plan.max_customers} Customers
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CirclePlus className="h-4 w-4 text-primary" />
                      <span>
                        {plan.max_vendors === -1 ? 'Unlimited' : plan.max_vendors} Vendors
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CirclePlus className="h-4 w-4 text-primary" />
                      <span>
                        {plan.max_clients === -1 ? 'Unlimited' : plan.max_clients} Clients
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CirclePlus className="h-4 w-4 text-primary" />
                      <span>
                        {plan.storage_limit === -1 ? 'Unlimited' : `${plan.storage_limit} MB`} Storage
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      {plan.account ? (
                        <CirclePlus className="h-4 w-4 text-primary" />
                      ) : (
                        <CircleMinus className="h-4 w-4 text-destructive" />
                      )}
                      <span>{plan.account ? 'Enable' : 'Disable'} Account</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {plan.crm ? (
                        <CirclePlus className="h-4 w-4 text-primary" />
                      ) : (
                        <CircleMinus className="h-4 w-4 text-destructive" />
                      )}
                      <span>{plan.crm ? 'Enable' : 'Disable'} CRM</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {plan.hrm ? (
                        <CirclePlus className="h-4 w-4 text-primary" />
                      ) : (
                        <CircleMinus className="h-4 w-4 text-destructive" />
                      )}
                      <span>{plan.hrm ? 'Enable' : 'Disable'} HRM</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {plan.project ? (
                        <CirclePlus className="h-4 w-4 text-primary" />
                      ) : (
                        <CircleMinus className="h-4 w-4 text-destructive" />
                      )}
                      <span>{plan.project ? 'Enable' : 'Disable'} Project</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {plan.pos ? (
                        <CirclePlus className="h-4 w-4 text-primary" />
                      ) : (
                        <CircleMinus className="h-4 w-4 text-destructive" />
                      )}
                      <span>{plan.pos ? 'Enable' : 'Disable'} POS</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {plan.chatgpt ? (
                        <CirclePlus className="h-4 w-4 text-primary" />
                      ) : (
                        <CircleMinus className="h-4 w-4 text-destructive" />
                      )}
                      <span>{plan.chatgpt ? 'Enable' : 'Disable'} Chat GPT</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  {isCurrentPlan ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="shadow-none h-8 bg-green-50 text-green-700 border-green-100"
                      disabled
                    >
                      <Check className="h-4 w-4 mr-2" /> Current Plan
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="blue" 
                      className="shadow-none h-8"
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      Berlangganan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

