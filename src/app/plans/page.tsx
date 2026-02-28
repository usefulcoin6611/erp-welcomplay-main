"use client"

import { useState, useEffect, useCallback } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getPlanBadgeColorsSolid } from '@/lib/plan-badge-colors'
import { Switch } from '@/components/ui/switch'
import { Plus, Pencil, Trash, Check, X } from 'lucide-react'
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
import { toast } from 'sonner'

type Plan = {
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

const durations = [
  { value: 'lifetime', label: 'Lifetime' },
  { value: 'month', label: 'Per Month' },
  { value: 'year', label: 'Per Year' },
]

const defaultFormData = {
  name: '',
  price: '',
  duration: 'month',
  max_users: '',
  max_customers: '',
  max_venders: '',
  max_clients: '',
  storage_limit: '',
  trial_days: '0',
  account: true,
  crm: true,
  hrm: true,
  project: false,
  pos: false,
  chatgpt: false,
}

export default function PlansPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null)
  const [formData, setFormData] = useState(defaultFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const loadPlans = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/plans', { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setPlans(json.data)
      } else {
        toast.error(json.message || 'Failed to load plans')
      }
    } catch {
      toast.error('Failed to load plans')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPlans()
  }, [loadPlans])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Plan name is required'
    if (formData.price === '' || isNaN(Number(formData.price))) errors.price = 'Valid price is required'
    if (Number(formData.price) < 0) errors.price = 'Price must be non-negative'
    if (!formData.duration) errors.duration = 'Duration is required'
    if (formData.max_users === '' || isNaN(Number(formData.max_users))) errors.max_users = 'Valid number required (-1 for unlimited)'
    if (formData.max_customers === '' || isNaN(Number(formData.max_customers))) errors.max_customers = 'Valid number required'
    if (formData.max_venders === '' || isNaN(Number(formData.max_venders))) errors.max_venders = 'Valid number required'
    if (formData.max_clients === '' || isNaN(Number(formData.max_clients))) errors.max_clients = 'Valid number required'
    if (formData.storage_limit === '' || isNaN(Number(formData.storage_limit))) errors.storage_limit = 'Valid number required (-1 for unlimited)'
    if (formData.trial_days === '' || isNaN(Number(formData.trial_days))) errors.trial_days = 'Valid number required'
    if (Number(formData.trial_days) < 0) errors.trial_days = 'Trial days must be non-negative'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const buildPayload = () => ({
    name: formData.name.trim(),
    price: Number(formData.price),
    duration: formData.duration as 'lifetime' | 'month' | 'year',
    maxUsers: Number(formData.max_users),
    maxCustomers: Number(formData.max_customers),
    maxVenders: Number(formData.max_venders),
    maxClients: Number(formData.max_clients),
    storageLimit: Number(formData.storage_limit),
    trialDays: Number(formData.trial_days),
    hasAccount: formData.account,
    hasCrm: formData.crm,
    hasHrm: formData.hrm,
    hasProject: formData.project,
    hasPos: formData.pos,
    hasChatgpt: formData.chatgpt,
  })

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to create plan')
        return
      }
      toast.success('Plan created successfully')
      setDialogOpen(false)
      setFormData(defaultFormData)
      setFormErrors({})
      await loadPlans()
    } catch {
      toast.error('Failed to create plan')
    } finally {
      setSaving(false)
    }
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
    setFormErrors({})
    setEditDialogOpen(true)
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPlan || !validateForm()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/plans/${editingPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to update plan')
        return
      }
      toast.success('Plan updated successfully')
      setEditDialogOpen(false)
      setEditingPlan(null)
      setFormData(defaultFormData)
      setFormErrors({})
      await loadPlans()
    } catch {
      toast.error('Failed to update plan')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (plan: Plan) => {
    setPlanToDelete(plan)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!planToDelete) return
    setSaving(true)
    try {
      const res = await fetch(`/api/plans/${planToDelete.id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to delete plan')
        return
      }
      toast.success('Plan deleted successfully')
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
      await loadPlans()
    } catch {
      toast.error('Failed to delete plan')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleDisable = async (plan: Plan) => {
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDisable: !plan.is_disable }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to update plan status')
        return
      }
      // Optimistic update
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_disable: !p.is_disable } : p))
      toast.success(`Plan ${plan.is_disable ? 'enabled' : 'disabled'} successfully`)
    } catch {
      toast.error('Failed to update plan status')
    }
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

  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Unlimited'
    return limit.toString()
  }

  const formatStorage = (limit: number) => {
    if (limit === -1) return 'Unlimited'
    if (limit >= 1000) return `${(limit / 1000).toFixed(0)} GB`
    return `${limit} MB`
  }

  const getDurationLabel = (duration: string) => {
    const found = durations.find((d) => d.value === duration)
    return found?.label || duration
  }

  // Shared form fields component
  const PlanFormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="f-name">Name <span className="text-red-500">*</span></Label>
          <Input
            id="f-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Free Plan, Silver, Gold, Platinum"
            className={formErrors.name ? 'border-red-500' : ''}
          />
          {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-price">Price (IDR) <span className="text-red-500">*</span></Label>
          <Input
            id="f-price"
            type="number"
            step="1000"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g. 0 (free), 250000, 750000, 1500000"
            className={formErrors.price ? 'border-red-500' : ''}
          />
          {formErrors.price && <p className="text-xs text-red-500">{formErrors.price}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="f-duration">Duration <span className="text-red-500">*</span></Label>
          <Select value={formData.duration} onValueChange={(v) => setFormData({ ...formData, duration: v })}>
            <SelectTrigger id="f-duration" className={formErrors.duration ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent>
              {durations.map((dur) => (
                <SelectItem key={dur.value} value={dur.value}>{dur.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.duration && <p className="text-xs text-red-500">{formErrors.duration}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-trial">Trial Days <span className="text-red-500">*</span></Label>
          <Input
            id="f-trial"
            type="number"
            min="0"
            value={formData.trial_days}
            onChange={(e) => setFormData({ ...formData, trial_days: e.target.value })}
            placeholder="e.g. 0, 7, 14, 30"
            className={formErrors.trial_days ? 'border-red-500' : ''}
          />
          {formErrors.trial_days && <p className="text-xs text-red-500">{formErrors.trial_days}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="f-users">Max Users <span className="text-red-500">*</span></Label>
          <Input
            id="f-users"
            type="number"
            value={formData.max_users}
            onChange={(e) => setFormData({ ...formData, max_users: e.target.value })}
            placeholder="e.g. 5, 20, 50, -1 (unlimited)"
            className={formErrors.max_users ? 'border-red-500' : ''}
          />
          {formErrors.max_users && <p className="text-xs text-red-500">{formErrors.max_users}</p>}
          <p className="text-xs text-muted-foreground">-1 = Unlimited</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-customers">Max Customers <span className="text-red-500">*</span></Label>
          <Input
            id="f-customers"
            type="number"
            value={formData.max_customers}
            onChange={(e) => setFormData({ ...formData, max_customers: e.target.value })}
            placeholder="e.g. 5, 100, 500, -1 (unlimited)"
            className={formErrors.max_customers ? 'border-red-500' : ''}
          />
          {formErrors.max_customers && <p className="text-xs text-red-500">{formErrors.max_customers}</p>}
          <p className="text-xs text-muted-foreground">-1 = Unlimited</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="f-vendors">Max Vendors <span className="text-red-500">*</span></Label>
          <Input
            id="f-vendors"
            type="number"
            value={formData.max_venders}
            onChange={(e) => setFormData({ ...formData, max_venders: e.target.value })}
            placeholder="e.g. 5, 50, 100, -1 (unlimited)"
            className={formErrors.max_venders ? 'border-red-500' : ''}
          />
          {formErrors.max_venders && <p className="text-xs text-red-500">{formErrors.max_venders}</p>}
          <p className="text-xs text-muted-foreground">-1 = Unlimited</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-clients">Max Clients <span className="text-red-500">*</span></Label>
          <Input
            id="f-clients"
            type="number"
            value={formData.max_clients}
            onChange={(e) => setFormData({ ...formData, max_clients: e.target.value })}
            placeholder="e.g. 5, 25, 50, -1 (unlimited)"
            className={formErrors.max_clients ? 'border-red-500' : ''}
          />
          {formErrors.max_clients && <p className="text-xs text-red-500">{formErrors.max_clients}</p>}
          <p className="text-xs text-muted-foreground">-1 = Unlimited</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="f-storage">Storage Limit (MB) <span className="text-red-500">*</span></Label>
        <Input
          id="f-storage"
          type="number"
          value={formData.storage_limit}
          onChange={(e) => setFormData({ ...formData, storage_limit: e.target.value })}
          placeholder="e.g. 1024 (1GB), 5000 (5GB), -1 (unlimited)"
          className={formErrors.storage_limit ? 'border-red-500' : ''}
        />
        {formErrors.storage_limit && <p className="text-xs text-red-500">{formErrors.storage_limit}</p>}
        <p className="text-xs text-muted-foreground">-1 = Unlimited</p>
      </div>

      {/* Module toggles */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Modules</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'account', label: 'Account' },
            { key: 'crm', label: 'CRM' },
            { key: 'hrm', label: 'HRM' },
            { key: 'project', label: 'Project' },
            { key: 'pos', label: 'POS' },
            { key: 'chatgpt', label: 'ChatGPT' },
          ].map((mod) => {
            const isEnabled = formData[mod.key as keyof typeof formData] as boolean
            return (
              <div
                key={mod.key}
                className={`flex items-center gap-2 p-2 border rounded-md transition-colors ${
                  isEnabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <Switch
                  id={`f-${mod.key}`}
                  checked={isEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, [mod.key]: checked })}
                  className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                />
                <Label
                  htmlFor={`f-${mod.key}`}
                  className={`text-sm cursor-pointer ${isEnabled ? 'text-blue-700 font-medium' : 'text-gray-600'}`}
                >
                  {mod.label}
                </Label>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

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
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">Subscription Plans</h1>
                <p className="text-sm text-muted-foreground">Manage your subscription plans</p>
              </div>
              {isSuperAdmin && (
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open)
                  if (!open) { setFormData(defaultFormData); setFormErrors({}) }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="blue" className="shadow-none">
                      <Plus className="mr-2 h-4 w-4" /> Create Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Plan</DialogTitle>
                      <DialogDescription>Add a new subscription plan to your system.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                      <PlanFormFields />
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="blue" disabled={saving}>
                          {saving ? 'Creating...' : 'Create Plan'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading plans...</p>
              </div>
            )}

            {/* Plans Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan) => (
                  <Card key={plan.id} className="relative flex flex-col rounded-lg overflow-hidden border-0 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.05)]">
                    {/* Plan Badge */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-center pt-3 pb-2">
                      <Badge className={`${getPlanBadgeColorsSolid(plan.name)} text-xs font-semibold px-3 py-1.5 rounded-full`}>
                        {plan.name}
                      </Badge>
                    </div>

                    {/* Active Switch - blue when plan is active (not disabled) */}
                    {isSuperAdmin && plan.price > 0 && (
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <Switch
                          checked={!plan.is_disable}
                          onCheckedChange={() => handleToggleDisable(plan)}
                          title={plan.is_disable ? 'Enable plan' : 'Disable plan'}
                          className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                        />
                      </div>
                    )}

                    <CardContent className="pt-12 pb-4 px-4 flex flex-col flex-1">
                      {/* Price */}
                      <div className="text-center mb-4">
                        <div className="flex items-baseline justify-center gap-1">
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
                          <p className="text-xs text-gray-500 font-medium mt-1">
                            {plan.trial_days} days free trial
                          </p>
                        )}
                      </div>

                      {/* Limits */}
                      <div className="space-y-1.5 mb-4 flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{formatLimit(plan.max_users)} Users</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{formatLimit(plan.max_customers)} Customers</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{formatLimit(plan.max_venders)} Vendors</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{formatLimit(plan.max_clients)} Clients</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{formatStorage(plan.storage_limit)} Storage</span>
                        </div>

                        {/* Modules */}
                        <div className="pt-2 border-t mt-2">
                          {[
                            { key: 'account', label: 'Account', enabled: plan.account },
                            { key: 'crm', label: 'CRM', enabled: plan.crm },
                            { key: 'hrm', label: 'HRM', enabled: plan.hrm },
                            { key: 'project', label: 'Project', enabled: plan.project },
                            { key: 'pos', label: 'POS', enabled: plan.pos },
                            { key: 'chatgpt', label: 'ChatGPT', enabled: plan.chatgpt },
                          ].map((mod) => (
                            <div key={mod.key} className="flex items-center gap-2 text-sm text-gray-600 py-0.5">
                              {mod.enabled ? (
                                <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                              ) : (
                                <X className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                              )}
                              <span className={mod.enabled ? '' : 'text-gray-400'}>{mod.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      {isSuperAdmin && (
                        <div className="flex gap-2 pt-3 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 shadow-none h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                            onClick={() => handleEdit(plan)}
                          >
                            <Pencil className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          {plan.price > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 shadow-none h-8 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                              onClick={() => handleDeleteClick(plan)}
                            >
                              <Trash className="h-3 w-3 mr-1" /> Delete
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {plans.length === 0 && !loading && (
                  <div className="col-span-4 text-center py-12 text-muted-foreground">
                    No plans found. Create your first plan.
                  </div>
                )}
              </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => {
              setEditDialogOpen(open)
              if (!open) { setEditingPlan(null); setFormData(defaultFormData); setFormErrors({}) }
            }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Plan</DialogTitle>
                  <DialogDescription>
                    Update plan information.
                    {editingPlan?.price === 0 && ' Free Plan cannot change price and duration.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateSubmit}>
                  <PlanFormFields />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="blue" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{planToDelete?.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPlanToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={saving}
                  >
                    {saving ? 'Deleting...' : 'Delete'}
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
