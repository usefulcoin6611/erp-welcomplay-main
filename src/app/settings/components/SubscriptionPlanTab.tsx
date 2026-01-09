"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Check, X, Pencil, CirclePlus, CircleMinus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

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
  const [plans, setPlans] = useState<Plan[]>(mockPlans)
  const [dialogOpen, setDialogOpen] = useState(false)

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
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="shadow-none">
              <Plus className="mr-2 h-4 w-4" /> Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Plan</DialogTitle>
              <DialogDescription>
                Create a new subscription plan for your system
              </DialogDescription>
            </DialogHeader>
            <form>
              <div className="grid gap-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Plan creation form would go here
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card key={plan.id} className="shadow-none relative">
            <Badge className="absolute top-4 right-4 bg-primary">{plan.name}</Badge>
            {plan.is_active && (
              <div className="absolute top-4 left-4">
                <div className="flex items-center gap-1 text-xs text-primary">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium">Active</span>
                </div>
              </div>
            )}
            <CardContent className="p-6">
              <div className="text-center mb-4 mt-4">
                <h1 className="text-3xl font-bold mb-2">
                  ${formatPrice(plan.price)}
                  <small className="text-sm font-normal text-muted-foreground">
                    /{getDurationLabel(plan.duration)}
                  </small>
                </h1>
                <p className="text-sm text-muted-foreground mb-1">
                  Free Trial Days: {plan.trial_days}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Left Column */}
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
                      {plan.storage_limit === -1 ? 'Unlimited' : plan.storage_limit + ' MB'}{' '}
                      Storage
                    </span>
                  </div>
                </div>

                {/* Right Column */}
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

              {plan.price > 0 && (
                <div className="flex justify-end mb-4">
                  <Switch
                    checked={!plan.is_disable}
                    onCheckedChange={(checked) => {
                      setPlans(
                        plans.map((p) =>
                          p.id === plan.id ? { ...p, is_disable: !checked } : p
                        )
                      )
                    }}
                  />
                </div>
              )}

              <div className="flex gap-2 justify-center">
                <Button variant="default" size="sm" className="shadow-none bg-info">
                  <Pencil className="h-4 w-4" />
                </Button>
                {plan.id !== '1' && (
                  <Button variant="destructive" size="sm" className="shadow-none">
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

