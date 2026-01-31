"use client"

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPlanBadgeColorsSolid } from '@/lib/plan-badge-colors'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
    price: 250000,
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
    price: 750000,
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
    price: 1500000,
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null)
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

  const handleDeleteClick = (plan: Plan) => {
    setPlanToDelete(plan)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (planToDelete) {
      setPlans(plans.filter((p) => p.id !== planToDelete.id))
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
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
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-50">
            {/* Header */}
            <div className="flex items-center justify-end">
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
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            <Label htmlFor="price" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                          <Label htmlFor="duration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            <Label htmlFor="max_users" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            <Label htmlFor="max_customers" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            <Label htmlFor="max_venders" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                            <Label htmlFor="max_clients" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                          <Label htmlFor="storage_limit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                            />
                            <Label htmlFor="account" className="text-sm font-medium text-gray-700 dark:text-gray-300">Account</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="crm"
                              checked={formData.crm}
                              onCheckedChange={(checked) => setFormData({ ...formData, crm: checked })}
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                            />
                            <Label htmlFor="crm" className="text-sm font-medium text-gray-700 dark:text-gray-300">CRM</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="hrm"
                              checked={formData.hrm}
                              onCheckedChange={(checked) => setFormData({ ...formData, hrm: checked })}
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                            />
                            <Label htmlFor="hrm" className="text-sm font-medium text-gray-700 dark:text-gray-300">HRM</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="project"
                              checked={formData.project}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, project: checked })
                              }
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                            />
                            <Label htmlFor="project" className="text-sm font-medium text-gray-700 dark:text-gray-300">Project</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="pos"
                              checked={formData.pos}
                              onCheckedChange={(checked) => setFormData({ ...formData, pos: checked })}
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                            />
                            <Label htmlFor="pos" className="text-sm font-medium text-gray-700 dark:text-gray-300">POS</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="chatgpt"
                              checked={formData.chatgpt}
                              onCheckedChange={(checked) =>
                                setFormData({ ...formData, chatgpt: checked })
                              }
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <Card key={plan.id} className="relative flex flex-col rounded-lg overflow-hidden border-0 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.05)]">
                  {/* Plan Badge - Top of Card */}
                  <div className="absolute top-0 left-0 right-0 flex items-center justify-center pt-3 pb-2">
                    <Badge className={`${getPlanBadgeColorsSolid(plan.name)} text-xs font-semibold px-3 py-1.5 rounded-full`}>
                      {plan.name}
                    </Badge>
                  </div>
                  {/* Switch - Top Right */}
                  {isSuperAdmin && plan.price > 0 && (
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <Switch
                        checked={plan.is_disable}
                        onCheckedChange={(checked) => {
                          setPlans(
                            plans.map((p) => (p.id === plan.id ? { ...p, is_disable: checked } : p))
                          )
                        }}
                        className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                  )}

                  <CardContent className="p-4 flex flex-col flex-1 pt-14">
                    {/* Price Section - Centered */}
                    <div className="mb-3 text-center">
                      <div className="flex items-baseline justify-center gap-1 mb-1">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(plan.price)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-sm text-gray-500 font-medium">
                            /{getDurationLabel(plan.duration)}
                          </span>
                        )}
                      </div>
                      {plan.trial_days > 0 && (
                        <p className="text-xs text-gray-500 font-medium">
                          {plan.trial_days} days free trial
                        </p>
                      )}
                    </div>

                      {/* Features - Compact Grid */}
                      <div className="flex-1 mb-3">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                          {/* Limits */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Check className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                              <span className="truncate">{formatLimit(plan.max_users)} Users</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Check className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                              <span className="truncate">{formatLimit(plan.max_customers)} Customers</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Check className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                              <span className="truncate">{formatLimit(plan.max_venders)} Vendors</span>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Check className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                              <span className="truncate">{formatLimit(plan.max_clients)} Clients</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Check className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                              <span className="truncate">{formatStorage(plan.storage_limit)}</span>
                            </div>
                          </div>
                        </div>

                      {/* Modules - Compact Grid */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3 pt-3 border-t">
                        {[
                          { key: 'account', label: 'Account', enabled: plan.account },
                          { key: 'crm', label: 'CRM', enabled: plan.crm },
                          { key: 'hrm', label: 'HRM', enabled: plan.hrm },
                          { key: 'project', label: 'Project', enabled: plan.project },
                          { key: 'pos', label: 'POS', enabled: plan.pos },
                          { key: 'chatgpt', label: 'ChatGPT', enabled: plan.chatgpt },
                        ].map((module) => (
                          <div key={module.key} className="flex items-center gap-1.5 text-sm">
                            {module.enabled ? (
                              <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                            )}
                            <span className={`truncate ${module.enabled ? 'text-gray-600' : 'text-gray-400'}`}>
                              {module.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    {isSuperAdmin ? (
                      <div className="flex items-center justify-center gap-2 pt-3 border-t mt-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="shadow-none h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                          onClick={() => handleEdit(plan)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {plan.id !== '1' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none h-8 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            onClick={() => handleDeleteClick(plan)}
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 pt-3 border-t mt-auto">
                        {plan.price > 0 && (
                          <Button variant="blue" size="sm" className="w-full shadow-none h-8 text-sm font-medium">
                            Buy Plan
                          </Button>
                        )}
                        {plan.trial_days > 0 && (
                          <Button variant="outline" size="sm" className="w-full shadow-none h-8 text-sm">
                            Start Free Trial
                          </Button>
                        )}
                        {plan.id !== '1' && (
                          <Button variant="outline" size="sm" className="w-full shadow-none h-8 text-sm">
                            <X className="h-3.5 w-3.5 mr-1.5" /> Send Request
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
                          <Label htmlFor="edit_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                              <Label htmlFor="edit_price" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                              <Label htmlFor="edit_duration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                          <Label htmlFor="edit_trial_days" className="text-sm font-medium text-gray-700 dark:text-gray-300">Trial Days</Label>
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
                            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                          />
                          <Label htmlFor="edit_account">Account</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit_crm"
                            checked={formData.crm}
                            onCheckedChange={(checked) => setFormData({ ...formData, crm: checked })}
                            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                          />
                          <Label htmlFor="edit_crm" className="text-sm font-medium text-gray-700 dark:text-gray-300">CRM</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit_hrm"
                            checked={formData.hrm}
                            onCheckedChange={(checked) => setFormData({ ...formData, hrm: checked })}
                            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                          />
                          <Label htmlFor="edit_hrm" className="text-sm font-medium text-gray-700 dark:text-gray-300">HRM</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit_project"
                            checked={formData.project}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, project: checked })
                            }
                            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                          />
                          <Label htmlFor="edit_project" className="text-sm font-medium text-gray-700 dark:text-gray-300">Project</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit_pos"
                            checked={formData.pos}
                            onCheckedChange={(checked) => setFormData({ ...formData, pos: checked })}
                            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                          />
                          <Label htmlFor="edit_pos" className="text-sm font-medium text-gray-700 dark:text-gray-300">POS</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit_chatgpt"
                            checked={formData.chatgpt}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, chatgpt: checked })
                            }
                            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                          />
                          <Label htmlFor="edit_chatgpt" className="text-sm font-medium text-gray-700 dark:text-gray-300">Chat GPT</Label>
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{planToDelete?.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPlanToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}


