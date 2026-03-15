"use client"

import { useState, useEffect, useCallback } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Button } from '@/components/ui/button'
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

// Plan-specific styling to make each card unique
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
    if (formData.max_users === '' || isNaN(Number(formData.max_users))) errors.max_users = 'Valid number required'
    if (formData.max_customers === '' || isNaN(Number(formData.max_customers))) errors.max_customers = 'Valid number required'
    if (formData.max_venders === '' || isNaN(Number(formData.max_venders))) errors.max_venders = 'Valid number required'
    if (formData.max_clients === '' || isNaN(Number(formData.max_clients))) errors.max_clients = 'Valid number required'
    if (formData.storage_limit === '' || isNaN(Number(formData.storage_limit))) errors.storage_limit = 'Valid number required'
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
      if (!res.ok || !json.success) { toast.error(json.message || 'Failed to create plan'); return }
      toast.success('Plan created successfully')
      setDialogOpen(false)
      setFormData(defaultFormData)
      setFormErrors({})
      await loadPlans()
    } catch { toast.error('Failed to create plan') }
    finally { setSaving(false) }
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
      if (!res.ok || !json.success) { toast.error(json.message || 'Failed to update plan'); return }
      toast.success('Plan updated successfully')
      setEditDialogOpen(false)
      setEditingPlan(null)
      setFormData(defaultFormData)
      setFormErrors({})
      await loadPlans()
    } catch { toast.error('Failed to update plan') }
    finally { setSaving(false) }
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
      if (!res.ok || !json.success) { toast.error(json.message || 'Failed to delete plan'); return }
      toast.success('Plan deleted successfully')
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
      await loadPlans()
    } catch { toast.error('Failed to delete plan') }
    finally { setSaving(false) }
  }

  const handleToggleDisable = async (plan: Plan) => {
    try {
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDisable: !plan.is_disable }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.message || 'Failed to update plan status'); return }
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, is_disable: !p.is_disable } : p))
      toast.success(`Plan ${plan.is_disable ? 'enabled' : 'disabled'} successfully`)
    } catch { toast.error('Failed to update plan status') }
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
  }
  const formatLimit = (limit: number) => limit === -1 ? 'Unlimited' : limit.toString()
  const formatStorage = (limit: number) => {
    if (limit === -1) return 'Unlimited'
    if (limit >= 1000) return `${(limit / 1000).toFixed(0)} GB`
    return `${limit} MB`
  }
  const getDurationLabel = (duration: string) => durations.find(d => d.value === duration)?.label || duration

  const modules = [
    { key: 'account', label: 'Account' },
    { key: 'crm', label: 'CRM' },
    { key: 'hrm', label: 'HRM' },
    { key: 'project', label: 'Project' },
    { key: 'pos', label: 'POS' },
    { key: 'chatgpt', label: 'ChatGPT' },
  ]

  const PlanFormFields = () => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Name <span className="text-red-500">*</span></Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Free Plan, Silver, Gold, Platinum"
            className={`bg-gray-50 ${formErrors.name ? 'border-red-500' : 'border-0'}`}
          />
          {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Price (IDR) <span className="text-red-500">*</span></Label>
          <Input
            type="number" step="1000" min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g. 0 (free), 250000, 750000"
            className={`bg-gray-50 ${formErrors.price ? 'border-red-500' : 'border-0'}`}
          />
          {formErrors.price && <p className="text-xs text-red-500">{formErrors.price}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Duration <span className="text-red-500">*</span></Label>
          <Select value={formData.duration} onValueChange={(v) => setFormData({ ...formData, duration: v })}>
            <SelectTrigger className={`bg-gray-50 ${formErrors.duration ? 'border-red-500' : 'border-0'}`}>
              <SelectValue placeholder="Select Duration" />
            </SelectTrigger>
            <SelectContent>
              {durations.map((dur) => <SelectItem key={dur.value} value={dur.value}>{dur.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {formErrors.duration && <p className="text-xs text-red-500">{formErrors.duration}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Trial Days <span className="text-red-500">*</span></Label>
          <Input
            type="number" min="0"
            value={formData.trial_days}
            onChange={(e) => setFormData({ ...formData, trial_days: e.target.value })}
            placeholder="e.g. 0, 7, 14, 30"
            className={`bg-gray-50 ${formErrors.trial_days ? 'border-red-500' : 'border-0'}`}
          />
          {formErrors.trial_days && <p className="text-xs text-red-500">{formErrors.trial_days}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Max Users <span className="text-red-500">*</span></Label>
          <Input type="number" value={formData.max_users} onChange={(e) => setFormData({ ...formData, max_users: e.target.value })} placeholder="e.g. 5, 20, 50, -1 (unlimited)" className={`bg-gray-50 ${formErrors.max_users ? 'border-red-500' : 'border-0'}`} />
          {formErrors.max_users && <p className="text-xs text-red-500">{formErrors.max_users}</p>}
          <p className="text-xs text-muted-foreground">-1 = Unlimited</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Max Customers <span className="text-red-500">*</span></Label>
          <Input type="number" value={formData.max_customers} onChange={(e) => setFormData({ ...formData, max_customers: e.target.value })} placeholder="e.g. 5, 100, 500, -1 (unlimited)" className={`bg-gray-50 ${formErrors.max_customers ? 'border-red-500' : 'border-0'}`} />
          {formErrors.max_customers && <p className="text-xs text-red-500">{formErrors.max_customers}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Max Vendors <span className="text-red-500">*</span></Label>
          <Input type="number" value={formData.max_venders} onChange={(e) => setFormData({ ...formData, max_venders: e.target.value })} placeholder="e.g. 5, 50, 100, -1 (unlimited)" className={`bg-gray-50 ${formErrors.max_venders ? 'border-red-500' : 'border-0'}`} />
          {formErrors.max_venders && <p className="text-xs text-red-500">{formErrors.max_venders}</p>}
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Max Clients <span className="text-red-500">*</span></Label>
          <Input type="number" value={formData.max_clients} onChange={(e) => setFormData({ ...formData, max_clients: e.target.value })} placeholder="e.g. 5, 25, 50, -1 (unlimited)" className={`bg-gray-50 ${formErrors.max_clients ? 'border-red-500' : 'border-0'}`} />
          {formErrors.max_clients && <p className="text-xs text-red-500">{formErrors.max_clients}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Storage Limit (MB) <span className="text-red-500">*</span></Label>
        <Input type="number" value={formData.storage_limit} onChange={(e) => setFormData({ ...formData, storage_limit: e.target.value })} placeholder="e.g. 1024 (1GB), 5000 (5GB), -1 (unlimited)" className={`bg-gray-50 ${formErrors.storage_limit ? 'border-red-500' : 'border-0'}`} />
        {formErrors.storage_limit && <p className="text-xs text-red-500">{formErrors.storage_limit}</p>}
        <p className="text-xs text-muted-foreground">-1 = Unlimited</p>
      </div>
      {/* Module toggles */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Modules</Label>
        <div className="grid grid-cols-3 gap-2">
          {modules.map((mod) => {
            const isEnabled = formData[mod.key as keyof typeof formData] as boolean
            return (
              <div
                key={mod.key}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors ${isEnabled ? 'bg-blue-50' : 'bg-gray-50'}`}
              >
                <Switch
                  id={`f-${mod.key}`}
                  checked={isEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, [mod.key]: checked })}
                  className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                />
                <Label
                  htmlFor={`f-${mod.key}`}
                  className={`text-xs cursor-pointer ${isEnabled ? 'text-blue-700 font-semibold' : 'text-gray-500'}`}
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
      style={{ '--sidebar-width': 'calc(var(--spacing) * 72)', '--header-height': 'calc(var(--spacing) * 12)' } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <MainContentWrapper>
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100 min-h-screen">

            {/* Page Header */}
            <div className="bg-white rounded-2xl px-6 py-4 flex items-center justify-between gap-4 shadow-sm">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Subscription Plans</h1>
                <p className="text-sm text-muted-foreground">{plans.length} plans available</p>
              </div>
              {isSuperAdmin && (
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                  setDialogOpen(open)
                  if (!open) { setFormData(defaultFormData); setFormErrors({}) }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="blue" className="shadow-none rounded-lg h-9 px-4">
                      <Plus className="mr-1.5 h-4 w-4" /> Create Plan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Plan</DialogTitle>
                      <DialogDescription>Add a new subscription plan to your system.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                      <PlanFormFields />
                      <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">Cancel</Button>
                        <Button type="submit" variant="blue" disabled={saving} className="rounded-lg">
                          {saving ? 'Creating...' : 'Create Plan'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center bg-white rounded-2xl px-8 py-6 shadow-md">
                  <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">Loading plans...</p>
                </div>
              </div>
            )}

            {/* Plans Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plans.map((plan) => {
                  const style = getPlanCardStyle(plan.name)
                  return (
                    <div
                      key={plan.id}
                      className={`group relative flex flex-col h-full ${style.card} rounded-2xl overflow-hidden shadow-sm`}
                    >
                      <div className="flex flex-col flex-1 p-6">
                        {/* Plan name pill */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
                            {plan.name}
                          </span>
                          {isSuperAdmin && (
                            <Switch
                              checked={!plan.is_disable}
                              onCheckedChange={() => handleToggleDisable(plan)}
                              title={plan.is_disable ? 'Enable plan' : 'Disable plan'}
                              className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
                            />
                          )}
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
                            const enabled = plan[mod.key as keyof Plan] as boolean
                            return (
                              <span
                                key={mod.key}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${enabled ? `${style.badge}` : 'text-slate-400 bg-slate-100'}`}
                              >
                                {enabled ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={2} />}
                                {mod.label}
                              </span>
                            )
                          })}
                        </div>

                        {/* Actions - anchored at bottom, no border, color-separated */}
                        {isSuperAdmin && (
                          <div className="flex gap-2 pt-4 mt-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-9 text-xs font-semibold rounded-xl border-0 bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800"
                              onClick={() => handleEdit(plan)}
                            >
                              <Pencil className="h-3 w-3 mr-1" /> Edit
                            </Button>
                            {plan.price > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex-1 h-9 text-xs font-semibold rounded-xl border-0 bg-red-100 text-red-700 hover:bg-red-200 hover:text-red-800"
                                onClick={() => handleDeleteClick(plan)}
                              >
                                <Trash className="h-3 w-3 mr-1" /> Delete
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {plans.length === 0 && !loading && (
                  <div className="col-span-4 bg-white rounded-2xl py-20 text-center shadow-md">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-7 w-7 text-slate-500" />
                    </div>
                    <p className="text-base font-bold text-slate-700">No plans found.</p>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Create your first subscription plan.</p>
                  </div>
                )}
              </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => {
              setEditDialogOpen(open)
              if (!open) { setEditingPlan(null); setFormData(defaultFormData); setFormErrors({}) }
            }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Plan</DialogTitle>
                  <DialogDescription>
                    Update plan information.
                    {editingPlan?.price === 0 && ' Free Plan cannot change price and duration.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateSubmit}>
                  <PlanFormFields />
                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-lg">Cancel</Button>
                    <Button type="submit" variant="blue" disabled={saving} className="rounded-lg">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>"{planToDelete?.name}"</strong>? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPlanToDelete(null)} className="rounded-lg">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className="bg-red-600 hover:bg-red-700 rounded-lg"
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
