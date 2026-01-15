"use client"

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Trash, Check, X, CirclePlus, CircleMinus } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'

// Types
interface Plan {
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

// Mock data - sesuai referensi: Free Plan, Platinum, Gold, Silver
const mockPlans: Plan[] = [
  {
    id: '1',
    name: 'Free Plan',
    price: 0,
    duration: 'lifetime',
    max_users: 5,
    max_customers: 5,
    max_venders: 5,
    max_clients: 5,
    storage_limit: 1024,
    trial_days: 0,
    is_disable: true,
    account: true,
    crm: true,
    hrm: true,
    project: true,
    pos: true,
    chatgpt: true,
  },
  {
    id: '2',
    name: 'Silver',
    price: 49,
    duration: 'month',
    max_users: 20,
    max_customers: 100,
    max_venders: 50,
    max_clients: 25,
    storage_limit: 5000,
    trial_days: 7,
    is_disable: true,
    account: true,
    crm: true,
    hrm: true,
    project: false,
    pos: false,
    chatgpt: false,
  },
  {
    id: '3',
    name: 'Gold',
    price: 99,
    duration: 'month',
    max_users: 50,
    max_customers: 500,
    max_venders: 100,
    max_clients: 50,
    storage_limit: 10000,
    trial_days: 14,
    is_disable: true,
    account: true,
    crm: true,
    hrm: true,
    project: true,
    pos: true,
    chatgpt: false,
  },
  {
    id: '4',
    name: 'Platinum',
    price: 199,
    duration: 'month',
    max_users: -1,
    max_customers: -1,
    max_venders: -1,
    max_clients: -1,
    storage_limit: -1,
    trial_days: 30,
    is_disable: true,
    account: true,
    crm: true,
    hrm: true,
    project: true,
    pos: true,
    chatgpt: true,
  },
]

const durations = [
  { value: 'lifetime', label: 'Lifetime' },
  { value: 'month', label: 'Per Month' },
  { value: 'year', label: 'Per Year' },
]

export default function PlansPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'
  const [plans, setPlans] = useState<Plan[]>(mockPlans)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    max_users: '',
    max_customers: '',
    max_venders: '',
    max_clients: '',
    storage_limit: '',
    trial_days: '',
    account: false,
    crm: false,
    hrm: false,
    project: false,
    pos: false,
    chatgpt: false,
  })

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form data:', formData)
    setDialogOpen(false)
    // Reset form
    setFormData({
      name: '',
      price: '',
      duration: '',
      max_users: '',
      max_customers: '',
      max_venders: '',
      max_clients: '',
      storage_limit: '',
      trial_days: '',
      account: false,
      crm: false,
      hrm: false,
      project: false,
      pos: false,
      chatgpt: false,
    })
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration: plan.duration,
      max_users: plan.max_users.toString(),
      max_customers: plan.max_customers.toString(),
      max_venders: plan.max_venders.toString(),
      max_clients: plan.max_clients.toString(),
      storage_limit: plan.storage_limit.toString(),
      trial_days: plan.trial_days.toString(),
      account: plan.account,
      crm: plan.crm,
      hrm: plan.hrm,
      project: plan.project,
      pos: plan.pos,
      chatgpt: plan.chatgpt,
    })
    setEditDialogOpen(true)
  }

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPlan) return

    // Update plan in state
    setPlans(
      plans.map((p) =>
        p.id === editingPlan.id
          ? {
              ...p,
              name: formData.name,
              price: parseFloat(formData.price),
              duration: formData.duration as 'lifetime' | 'month' | 'year',
              max_users: parseInt(formData.max_users),
              max_customers: parseInt(formData.max_customers),
              max_venders: parseInt(formData.max_venders),
              max_clients: parseInt(formData.max_clients),
              storage_limit: parseInt(formData.storage_limit),
              trial_days: parseInt(formData.trial_days),
              account: formData.account,
              crm: formData.crm,
              hrm: formData.hrm,
              project: formData.project,
              pos: formData.pos,
              chatgpt: formData.chatgpt,
            }
          : p
      )
    )

    setEditDialogOpen(false)
    setEditingPlan(null)
    // Reset form
    setFormData({
      name: '',
      price: '',
      duration: '',
      max_users: '',
      max_customers: '',
      max_venders: '',
      max_clients: '',
      storage_limit: '',
      trial_days: '',
      account: false,
      crm: false,
      hrm: false,
      project: false,
      pos: false,
      chatgpt: false,
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID').format(price)
  }

  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Unlimited'
    return limit.toString()
  }

  const formatStorage = (limit: number) => {
    if (limit === -1) return 'Unlimited'
    return `${limit} MB`
  }

  const getDurationLabel = (duration: string) => {
    const found = durations.find((d) => d.value === duration)
    return found?.label || duration
  }

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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Manage Plan</h1>
                <p className="text-sm text-muted-foreground">
                  Create and manage subscription plans
                </p>
              </div>
              {isSuperAdmin && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="blue" className="shadow-none">
                      <Plus className="mr-2 h-4 w-4" /> Create Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Plan</DialogTitle>
                      <DialogDescription>
                        Add a new subscription plan to your system.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">
                              Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Enter Plan Name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price">
                              Price <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              placeholder="Enter Plan Price"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="duration">
                            Duration <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.duration}
                            onValueChange={(value) => setFormData({ ...formData, duration: value })}
                          >
                            <SelectTrigger id="duration">
                              <SelectValue placeholder="Select Duration" />
                            </SelectTrigger>
                            <SelectContent>
                              {durations.map((dur) => (
                                <SelectItem key={dur.value} value={dur.value}>
                                  {dur.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="max_users">
                              Maximum Users <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="max_users"
                              type="number"
                              value={formData.max_users}
                              onChange={(e) =>
                                setFormData({ ...formData, max_users: e.target.value })
                              }
                              placeholder="Enter Maximum Users"
                              required
                            />
                            <p className="text-xs text-muted-foreground">Note: "-1" for Unlimited</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="max_customers">
                              Maximum Customers <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="max_customers"
                              type="number"
                              value={formData.max_customers}
                              onChange={(e) =>
                                setFormData({ ...formData, max_customers: e.target.value })
                              }
                              placeholder="Enter Maximum Customers"
                              required
                            />
                            <p className="text-xs text-muted-foreground">Note: "-1" for Unlimited</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="max_venders">
                              Maximum Vendors <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="max_venders"
                              type="number"
                              value={formData.max_venders}
                              onChange={(e) =>
                                setFormData({ ...formData, max_venders: e.target.value })
                              }
                              placeholder="Enter Maximum Vendors"
                              required
                            />
                            <p className="text-xs text-muted-foreground">Note: "-1" for Unlimited</p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="max_clients">
                              Maximum Clients <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="max_clients"
                              type="number"
                              value={formData.max_clients}
                              onChange={(e) =>
                                setFormData({ ...formData, max_clients: e.target.value })
                              }
                              placeholder="Enter Maximum Clients"
                              required
                            />
                            <p className="text-xs text-muted-foreground">Note: "-1" for Unlimited</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="storage_limit">
                            Storage Limit <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="storage_limit"
                            type="number"
                            value={formData.storage_limit}
                            onChange={(e) =>
                              setFormData({ ...formData, storage_limit: e.target.value })
                            }
                            placeholder="Enter Storage Limit"
                            required
                          />
                          <p className="text-xs text-muted-foreground">Note: "-1" for Unlimited</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="account"
                              checked={formData.account}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, account: checked })
                              }
                            />
                            <Label htmlFor="account">Account</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="crm"
                              checked={formData.crm}
                              onCheckedChange={(checked) => setFormData({ ...formData, crm: checked })}
                            />
                            <Label htmlFor="crm">CRM</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="hrm"
                              checked={formData.hrm}
                              onCheckedChange={(checked) => setFormData({ ...formData, hrm: checked })}
                            />
                            <Label htmlFor="hrm">HRM</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="project"
                              checked={formData.project}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, project: checked })
                              }
                            />
                            <Label htmlFor="project">Project</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="pos"
                              checked={formData.pos}
                              onCheckedChange={(checked) => setFormData({ ...formData, pos: checked })}
                            />
                            <Label htmlFor="pos">POS</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="chatgpt"
                              checked={formData.chatgpt}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, chatgpt: checked })
                              }
                            />
                            <Label htmlFor="chatgpt">Chat GPT</Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="blue" className="shadow-none">
                          Create Plan
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="relative">
                  <CardContent className="p-6">
                    {/* Plan Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-blue-500 text-white text-sm px-3 py-1">
                        {plan.name}
                      </Badge>
                      {isSuperAdmin && plan.price > 0 && (
                        <div className="flex items-center">
                          <Switch
                            checked={plan.is_disable}
                            onCheckedChange={(checked) => {
                              setPlans(
                                plans.map((p) => (p.id === plan.id ? { ...p, is_disable: checked } : p))
                              )
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <h1 className="text-3xl font-semibold mb-0">
                        ${formatPrice(plan.price)}
                        <small className="text-sm text-muted-foreground ml-1">
                          /{getDurationLabel(plan.duration)}
                        </small>
                      </h1>
                      <p className="text-sm text-muted-foreground mt-2">
                        Free Trial Days : {plan.trial_days || 0}
                      </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CirclePlus className="h-4 w-4 text-blue-500" />
                            {formatLimit(plan.max_users)} Users
                          </li>
                          <li className="flex items-center gap-2">
                            <CirclePlus className="h-4 w-4 text-blue-500" />
                            {formatLimit(plan.max_customers)} Customers
                          </li>
                          <li className="flex items-center gap-2">
                            <CirclePlus className="h-4 w-4 text-blue-500" />
                            {formatLimit(plan.max_venders)} Vendors
                          </li>
                          <li className="flex items-center gap-2">
                            <CirclePlus className="h-4 w-4 text-blue-500" />
                            {formatLimit(plan.max_clients)} Clients
                          </li>
                          <li className="flex items-center gap-2">
                            <CirclePlus className="h-4 w-4 text-blue-500" />
                            {formatStorage(plan.storage_limit)} Storage
                          </li>
                        </ul>
                      </div>
                      <div>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            {plan.account ? (
                              <CirclePlus className="h-4 w-4 text-blue-500" />
                            ) : (
                              <CircleMinus className="h-4 w-4 text-red-500" />
                            )}
                            {plan.account ? 'Enable' : 'Disable'} Account
                          </li>
                          <li className="flex items-center gap-2">
                            {plan.crm ? (
                              <CirclePlus className="h-4 w-4 text-blue-500" />
                            ) : (
                              <CircleMinus className="h-4 w-4 text-red-500" />
                            )}
                            {plan.crm ? 'Enable' : 'Disable'} CRM
                          </li>
                          <li className="flex items-center gap-2">
                            {plan.hrm ? (
                              <CirclePlus className="h-4 w-4 text-blue-500" />
                            ) : (
                              <CircleMinus className="h-4 w-4 text-red-500" />
                            )}
                            {plan.hrm ? 'Enable' : 'Disable'} HRM
                          </li>
                          <li className="flex items-center gap-2">
                            {plan.project ? (
                              <CirclePlus className="h-4 w-4 text-blue-500" />
                            ) : (
                              <CircleMinus className="h-4 w-4 text-red-500" />
                            )}
                            {plan.project ? 'Enable' : 'Disable'} Project
                          </li>
                          <li className="flex items-center gap-2">
                            {plan.pos ? (
                              <CirclePlus className="h-4 w-4 text-blue-500" />
                            ) : (
                              <CircleMinus className="h-4 w-4 text-red-500" />
                            )}
                            {plan.pos ? 'Enable' : 'Disable'} POS
                          </li>
                          <li className="flex items-center gap-2">
                            {plan.chatgpt ? (
                              <CirclePlus className="h-4 w-4 text-blue-500" />
                            ) : (
                              <CircleMinus className="h-4 w-4 text-red-500" />
                            )}
                            {plan.chatgpt ? 'Enable' : 'Disable'} Chat GPT
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* Actions */}
                    {isSuperAdmin ? (
                      <div className="flex items-center justify-center gap-2 pt-4 border-t">
                        <Button
                          variant="blue"
                          size="sm"
                          className="shadow-none"
                          onClick={() => handleEdit(plan)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {plan.id !== '1' && (
                          <Button variant="destructive" size="sm" className="shadow-none">
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 pt-4 border-t">
                        {plan.price > 0 && (
                          <Button variant="blue" size="sm" className="w-full shadow-none">
                            Buy Plan
                          </Button>
                        )}
                        {plan.trial_days > 0 && (
                          <Button variant="outline" size="sm" className="w-full shadow-none">
                            Start Free Trial
                          </Button>
                        )}
                        {plan.id !== '1' && (
                          <Button variant="outline" size="sm" className="w-full shadow-none">
                            <X className="h-4 w-4 mr-2" /> Send Request
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Edit Plan Dialog */}
            {editingPlan && (
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Plan</DialogTitle>
                    <DialogDescription>
                      Update plan information. Free Plan (ID: 1) cannot change price and duration.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_name">
                            Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="edit_name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter Plan Name"
                            required
                          />
                        </div>
                        {editingPlan.id !== '1' && (
                          <>
                            <div className="space-y-2">
                              <Label htmlFor="edit_price">
                                Price <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="edit_price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="Enter Plan Price"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit_duration">
                                Duration <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={formData.duration}
                                onValueChange={(value) => setFormData({ ...formData, duration: value })}
                              >
                                <SelectTrigger id="edit_duration">
                                  <SelectValue placeholder="Select Duration" />
                                </SelectTrigger>
                                <SelectContent>
                                  {durations.map((dur) => (
                                    <SelectItem key={dur.value} value={dur.value}>
                                      {dur.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_max_users">
                            Maximum Users <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="edit_max_users"
                            type="number"
                            value={formData.max_users}
                            onChange={(e) =>
                              setFormData({ ...formData, max_users: e.target.value })
                            }
                            placeholder="Enter Maximum Users"
                            required
                          />
                          <p className="text-xs text-muted-foreground">Note: "-1" for Unlimited</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit_max_customers">
                            Maximum Customers <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="edit_max_customers"
                            type="number"
                            value={formData.max_customers}
                            onChange={(e) =>
                              setFormData({ ...formData, max_customers: e.target.value })
                            }
                            placeholder="Enter Maximum Customers"
                            required
                          />
                          <p className="text-xs text-muted-foreground">Note: "-1" for Unlimited</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit_max_venders">
                            Maximum Vendors <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="edit_max_venders"
                            type="number"
                            value={formData.max_venders}
                            onChange={(e) =>
                              setFormData({ ...formData, max_venders: e.target.value })
                            }
                            placeholder="Enter Maximum Vendors"
                            required
                          />
                          <p className="text-xs text-muted-foreground">Note: "-1" for Unlimited</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit_max_clients">
                            Maximum Clients <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="edit_max_clients"
                            type="number"
                            value={formData.max_clients}
                            onChange={(e) =>
                              setFormData({ ...formData, max_clients: e.target.value })
                            }
                            placeholder="Enter Maximum Clients"
                            required
                          />
                          <p className="text-xs text-muted-foreground">Note: "-1" for Unlimited</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_storage_limit">
                          Storage Limit <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="edit_storage_limit"
                          type="number"
                          value={formData.storage_limit}
                          onChange={(e) =>
                            setFormData({ ...formData, storage_limit: e.target.value })
                          }
                          placeholder="Enter Storage Limit"
                          required
                        />
                        <p className="text-xs text-muted-foreground">Note: "-1" for Unlimited</p>
                      </div>
                      {editingPlan.id !== '1' && (
                        <div className="space-y-2">
                          <Label htmlFor="edit_trial_days">Trial Days</Label>
                          <Input
                            id="edit_trial_days"
                            type="number"
                            value={formData.trial_days}
                            onChange={(e) =>
                              setFormData({ ...formData, trial_days: e.target.value })
                            }
                            placeholder="Enter Trial Days"
                            min="1"
                          />
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit_account"
                            checked={formData.account}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, account: checked })
                            }
                          />
                          <Label htmlFor="edit_account">Account</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit_crm"
                            checked={formData.crm}
                            onCheckedChange={(checked) => setFormData({ ...formData, crm: checked })}
                          />
                          <Label htmlFor="edit_crm">CRM</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit_hrm"
                            checked={formData.hrm}
                            onCheckedChange={(checked) => setFormData({ ...formData, hrm: checked })}
                          />
                          <Label htmlFor="edit_hrm">HRM</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit_project"
                            checked={formData.project}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, project: checked })
                            }
                          />
                          <Label htmlFor="edit_project">Project</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit_pos"
                            checked={formData.pos}
                            onCheckedChange={(checked) => setFormData({ ...formData, pos: checked })}
                          />
                          <Label htmlFor="edit_pos">POS</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit_chatgpt"
                            checked={formData.chatgpt}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, chatgpt: checked })
                            }
                          />
                          <Label htmlFor="edit_chatgpt">Chat GPT</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditDialogOpen(false)
                          setEditingPlan(null)
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="blue" className="shadow-none">
                        Update Plan
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
