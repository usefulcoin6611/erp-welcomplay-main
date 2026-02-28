"use client"

import { useState, useEffect, useCallback } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { getPlanBadgeColors } from '@/lib/plan-badge-colors'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Plus, MoreVertical, Pencil, Trash, Lock, Calendar, Clock,
  Users, Building2, RotateCcw, LogIn, LogOut, ShoppingCart, Check, Search
} from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

interface Company {
  id: string
  name: string
  email: string
  avatar?: string | null
  plan?: string | null
  plan_expire_date?: string | null
  is_active: boolean
  is_enable_login: boolean
  last_login_at?: string | null
  delete_status: number
  branchId?: string | null
  branchName?: string | null
  createdAt: string
}

interface CompanyUser {
  id: string
  name: string
  avatar?: string
  is_disable: boolean
}

const defaultFormData = {
  name: '',
  email: '',
  plan: 'none',
  password: '',
  planExpireDate: '',
  isEnableLogin: true,
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [adminHubDialogOpen, setAdminHubDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const [formData, setFormData] = useState(defaultFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [newPassword, setNewPassword] = useState('')

  const [availablePlans, setAvailablePlans] = useState<{ id: string; name: string; price: number; duration: string; max_users: number; max_customers: number; max_venders: number }[]>([])
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const loadCompanies = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (showDeleted) params.set('includeDeleted', 'true')
      const res = await fetch(`/api/companies?${params.toString()}`, { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setCompanies(json.data)
      } else {
        toast.error(json.message || 'Failed to load companies')
      }
    } catch {
      toast.error('Failed to load companies')
    } finally {
      setLoading(false)
    }
  }, [search, showDeleted])

  const loadPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/plans', { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) setAvailablePlans(json.data)
    } catch {}
  }, [])

  useEffect(() => {
    loadCompanies()
    loadPlans()
  }, [loadCompanies, loadPlans])

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Company name is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email address'
    if (formData.password && formData.password.length < 6) errors.password = 'Password must be at least 6 characters'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const buildPayload = () => ({
    name: formData.name.trim(),
    email: formData.email.trim(),
    password: formData.password || null,
    plan: (formData.plan && formData.plan !== 'none') ? formData.plan : null,
    planExpireDate: formData.planExpireDate || null,
    isEnableLogin: formData.isEnableLogin,
  })

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.message || 'Failed to create company'); return }
      toast.success('Company created successfully')
      setCreateDialogOpen(false)
      setFormData(defaultFormData)
      setFormErrors({})
      await loadCompanies()
    } catch { toast.error('Failed to create company') }
    finally { setSaving(false) }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompany || !validateForm()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.message || 'Failed to update company'); return }
      toast.success('Company updated successfully')
      setEditDialogOpen(false)
      setSelectedCompany(null)
      setFormData(defaultFormData)
      setFormErrors({})
      await loadCompanies()
    } catch { toast.error('Failed to update company') }
    finally { setSaving(false) }
  }

  const handleEditClick = (company: Company) => {
    setSelectedCompany(company)
    setFormData({
      name: company.name,
      email: company.email,
      plan: company.plan || 'none',
      password: '',
      planExpireDate: company.plan_expire_date || '',
      isEnableLogin: company.is_enable_login,
    })
    setFormErrors({})
    setEditDialogOpen(true)
  }

  const handleToggleLogin = async (company: Company) => {
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnableLogin: !company.is_enable_login }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.message || 'Failed to update login status'); return }
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_enable_login: !c.is_enable_login } : c))
      toast.success(`Login ${!company.is_enable_login ? 'enabled' : 'disabled'} for ${company.name}`)
    } catch { toast.error('Failed to update login status') }
  }

  const handleResetPassword = async () => {
    if (!selectedCompany || !newPassword) { toast.error('New password is required'); return }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSaving(true)
    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.message || 'Failed to reset password'); return }
      toast.success('Password reset successfully')
      setResetPasswordDialogOpen(false)
      setNewPassword('')
      setSelectedCompany(null)
    } catch { toast.error('Failed to reset password') }
    finally { setSaving(false) }
  }

  const handleUpgradePlan = async (planName: string) => {
    if (!selectedCompany) return
    setSaving(true)
    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}/upgrade-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planName }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) { toast.error(json.message || 'Failed to upgrade plan'); return }
      toast.success(`Plan upgraded to ${planName} successfully`)
      setUpgradeDialogOpen(false)
      setSelectedCompany(null)
      await loadCompanies()
    } catch { toast.error('Failed to upgrade plan') }
    finally { setSaving(false) }
  }

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return
    setSaving(true)
    try {
      if (companyToDelete.delete_status === 0) {
        const res = await fetch(`/api/companies/${companyToDelete.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true }),
        })
        const json = await res.json()
        if (!res.ok || !json.success) { toast.error(json.message || 'Failed to restore company'); return }
        toast.success('Company restored successfully')
      } else {
        const res = await fetch(`/api/companies/${companyToDelete.id}`, { method: 'DELETE' })
        const json = await res.json()
        if (!res.ok || !json.success) { toast.error(json.message || 'Failed to delete company'); return }
        toast.success('Company deactivated successfully')
      }
      setDeleteDialogOpen(false)
      setCompanyToDelete(null)
      await loadCompanies()
    } catch { toast.error('Failed to process request') }
    finally { setSaving(false) }
  }

  const handleOpenAdminHub = async (company: Company) => {
    setSelectedCompany(company)
    setAdminHubDialogOpen(true)
    setLoadingUsers(true)
    try {
      const res = await fetch(`/api/users?branchId=${company.branchId}`, { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setCompanyUsers(json.data.map((u: any) => ({ id: u.id, name: u.name || u.email, avatar: u.image, is_disable: false })))
      }
    } catch { setCompanyUsers([]) }
    finally { setLoadingUsers(false) }
  }

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }
  const formatTime = (d: string | null | undefined) => {
    if (!d) return '-'
    return new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  const formatExpireDate = (d: string | null | undefined) => {
    if (!d) return 'Lifetime'
    return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
  }
  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
  }
  const formatLimit = (limit: number) => limit === -1 ? 'Unlimited' : limit.toString()

  const CompanyFormFields = () => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="c-name" className="text-sm font-medium">Company Name <span className="text-red-500">*</span></Label>
          <Input
            id="c-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Acme Corporation"
            className={`bg-gray-50 ${formErrors.name ? 'border-red-500' : 'border-0'}`}
          />
          {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-email" className="text-sm font-medium">Email <span className="text-red-500">*</span></Label>
          <Input
            id="c-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="admin@company.com"
            className={`bg-gray-50 ${formErrors.email ? 'border-red-500' : 'border-0'}`}
          />
          {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="c-plan" className="text-sm font-medium">Plan</Label>
          <Select value={formData.plan} onValueChange={(v) => setFormData({ ...formData, plan: v })}>
            <SelectTrigger id="c-plan" className="bg-gray-50 border-0">
              <SelectValue placeholder="Select Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Plan</SelectItem>
              {availablePlans.map((p) => (
                <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-expire" className="text-sm font-medium">Plan Expire Date</Label>
          <Input
            id="c-expire"
            type="date"
            value={formData.planExpireDate}
            onChange={(e) => setFormData({ ...formData, planExpireDate: e.target.value })}
            className="bg-gray-50 border-0"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-password" className="text-sm font-medium">
          Password {selectedCompany ? <span className="text-muted-foreground font-normal">(leave blank to keep current)</span> : ''}
        </Label>
        <Input
          id="c-password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder={selectedCompany ? 'Leave blank to keep current' : 'Enter password (min 6 chars)'}
          className={`bg-gray-50 ${formErrors.password ? 'border-red-500' : 'border-0'}`}
        />
        {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
      </div>
      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
        <div>
          <Label htmlFor="c-login" className="text-sm font-medium cursor-pointer">Enable Login</Label>
          <p className="text-xs text-muted-foreground">Allow this company to log in</p>
        </div>
        <Switch
          id="c-login"
          checked={formData.isEnableLogin}
          onCheckedChange={(checked) => setFormData({ ...formData, isEnableLogin: checked })}
          className="data-[state=checked]:bg-blue-500"
        />
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
                <h1 className="text-lg font-semibold text-gray-900">Companies</h1>
                <p className="text-sm text-muted-foreground">{companies.length} companies registered</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 w-56 bg-gray-50 border-0 shadow-none rounded-lg"
                  />
                </div>
                {/* Show Deleted Toggle */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <Switch
                    checked={showDeleted}
                    onCheckedChange={setShowDeleted}
                    className="data-[state=checked]:bg-blue-500"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Show Deleted</span>
                </div>
                {/* Create Button */}
                <Dialog open={createDialogOpen} onOpenChange={(open) => {
                  setCreateDialogOpen(open)
                  if (!open) { setFormData(defaultFormData); setFormErrors({}) }
                }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="blue" className="shadow-none rounded-lg h-9 px-4">
                      <Plus className="mr-1.5 h-4 w-4" /> Create Company
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Company</DialogTitle>
                      <DialogDescription>Add a new company to your system.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                      <CompanyFormFields />
                      <DialogFooter className="gap-2">
                        <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} className="rounded-lg">Cancel</Button>
                        <Button type="submit" variant="blue" disabled={saving} className="rounded-lg">
                          {saving ? 'Creating...' : 'Create Company'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Loading companies...</p>
                </div>
              </div>
            )}

            {/* Companies Grid */}
            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {companies.map((company) => (
                  <div key={company.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Card Header - Blue gradient */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-4 pt-4 pb-8 relative">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={`${getPlanBadgeColors(company.plan || 'No Plan')} text-xs shadow-sm`}>
                          {company.plan || 'No Plan'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => handleEditClick(company)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => { setCompanyToDelete(company); setDeleteDialogOpen(true) }}
                              className={company.delete_status === 0 ? 'text-green-600' : 'text-destructive'}
                            >
                              {company.delete_status === 0 ? <><RotateCcw className="mr-2 h-4 w-4" /> Restore</> : <><Trash className="mr-2 h-4 w-4" /> Delete</>}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleOpenAdminHub(company)}>
                              <Building2 className="mr-2 h-4 w-4" /> Admin Hub
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedCompany(company); setNewPassword(''); setResetPasswordDialogOpen(true) }}>
                              <Lock className="mr-2 h-4 w-4" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleLogin(company)}
                              className={company.is_enable_login ? 'text-destructive' : 'text-green-600'}
                            >
                              {company.is_enable_login ? <><LogOut className="mr-2 h-4 w-4" /> Disable Login</> : <><LogIn className="mr-2 h-4 w-4" /> Enable Login</>}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {/* Avatar */}
                      <div className="flex justify-center">
                        <Avatar className="h-16 w-16 ring-4 ring-white/40 shadow-lg">
                          <AvatarImage src={company.avatar ?? undefined} />
                          <AvatarFallback className="text-lg font-bold bg-white text-blue-600">
                            {getInitials(company.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="px-4 pb-4 -mt-4 relative">
                      {/* White rounded top overlap */}
                      <div className="bg-white rounded-2xl pt-4 px-0">
                        {/* Name + Email */}
                        <div className="text-center mb-3">
                          <h5 className="font-semibold text-sm text-gray-900 truncate">{company.name}</h5>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{company.email}</p>
                          {(company.delete_status === 0 || !company.is_enable_login) && (
                            <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                              {company.delete_status === 0 && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Deactivated</span>
                              )}
                              {!company.is_enable_login && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Login Off</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Last Login - gray section */}
                        <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="h-6 w-6 rounded-lg bg-blue-500 flex items-center justify-center">
                                <Calendar className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-xs text-gray-600">{formatDate(company.last_login_at)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="h-6 w-6 rounded-lg bg-blue-500 flex items-center justify-center">
                                <Clock className="h-3 w-3 text-white" />
                              </div>
                              <span className="text-xs text-gray-600">{formatTime(company.last_login_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mb-3">
                          <Button
                            variant="blue"
                            size="sm"
                            className="flex-1 h-8 text-xs rounded-lg shadow-none"
                            onClick={() => { setSelectedCompany(company); setUpgradeDialogOpen(true) }}
                          >
                            Upgrade Plan
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 h-8 text-xs rounded-lg shadow-none bg-gray-100 text-gray-700 hover:bg-gray-200"
                            onClick={() => handleOpenAdminHub(company)}
                          >
                            Admin Hub
                          </Button>
                        </div>

                        {/* Plan Expire - blue section */}
                        <div className="bg-blue-50 rounded-xl px-3 py-2 text-center">
                          <p className="text-xs text-blue-600 font-medium">
                            Expires: {formatExpireDate(company.plan_expire_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {companies.length === 0 && !loading && (
                  <div className="col-span-4 bg-white rounded-2xl py-16 text-center">
                    <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-muted-foreground">No companies found.</p>
                    <p className="text-sm text-muted-foreground mt-1">Create your first company to get started.</p>
                  </div>
                )}
              </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => {
              setEditDialogOpen(open)
              if (!open) { setSelectedCompany(null); setFormData(defaultFormData); setFormErrors({}) }
            }}>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Company</DialogTitle>
                  <DialogDescription>Update company information.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditSubmit}>
                  <CompanyFormFields />
                  <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} className="rounded-lg">Cancel</Button>
                    <Button type="submit" variant="blue" disabled={saving} className="rounded-lg">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Upgrade Plan Dialog */}
            <Dialog open={upgradeDialogOpen} onOpenChange={(open) => {
              setUpgradeDialogOpen(open)
              if (!open) setSelectedCompany(null)
            }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Upgrade Plan</DialogTitle>
                  <DialogDescription>Select a new plan for <strong>{selectedCompany?.name}</strong></DialogDescription>
                </DialogHeader>
                {selectedCompany && (
                  <div className="space-y-2 py-2">
                    {availablePlans.map((plan) => {
                      const isCurrentPlan = plan.name === selectedCompany.plan
                      return (
                        <div
                          key={plan.id}
                          className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                            isCurrentPlan ? 'bg-green-50' : 'bg-gray-50 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{plan.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatPrice(plan.price)}{plan.duration !== 'lifetime' ? `/${plan.duration}` : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>Users: {formatLimit(plan.max_users)}</span>
                              <span>Customers: {formatLimit(plan.max_customers)}</span>
                              <span>Vendors: {formatLimit(plan.max_venders)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            {isCurrentPlan ? (
                              <div className="h-9 w-9 rounded-xl bg-green-500 flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            ) : (
                              <Button
                                variant="blue"
                                size="sm"
                                className="h-9 w-9 p-0 rounded-xl shadow-none"
                                onClick={() => handleUpgradePlan(plan.name)}
                                disabled={saving}
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setUpgradeDialogOpen(false); setSelectedCompany(null) }} className="rounded-lg">
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Admin Hub Dialog */}
            <Dialog open={adminHubDialogOpen} onOpenChange={(open) => {
              setAdminHubDialogOpen(open)
              if (!open) { setSelectedCompany(null); setCompanyUsers([]) }
            }}>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Admin Hub</DialogTitle>
                  <DialogDescription>{selectedCompany?.name} — User Management</DialogDescription>
                </DialogHeader>
                {selectedCompany && (
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Total Users', value: companyUsers.length, color: 'bg-blue-500' },
                        { label: 'Active', value: companyUsers.filter(u => !u.is_disable).length, color: 'bg-green-500' },
                        { label: 'Disabled', value: companyUsers.filter(u => u.is_disable).length, color: 'bg-red-500' },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <p className="text-xl font-bold">{stat.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* User List */}
                    {loadingUsers ? (
                      <div className="text-center py-8 text-muted-foreground">Loading users...</div>
                    ) : companyUsers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {companyUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{user.name}</span>
                            </div>
                            <Switch
                              checked={!user.is_disable}
                              onCheckedChange={(checked) => {
                                setCompanyUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_disable: !checked } : u))
                              }}
                              className="data-[state=checked]:bg-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-gray-50 rounded-xl">
                        <Users className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm text-muted-foreground">No users found for this company</p>
                      </div>
                    )}
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAdminHubDialogOpen(false)} className="rounded-lg">Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={resetPasswordDialogOpen} onOpenChange={(open) => {
              setResetPasswordDialogOpen(open)
              if (!open) { setSelectedCompany(null); setNewPassword('') }
            }}>
              <DialogContent className="max-w-sm rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>Set a new password for <strong>{selectedCompany?.name}</strong></DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  <Label htmlFor="new-password" className="text-sm font-medium">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="bg-gray-50 border-0"
                  />
                </div>
                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setResetPasswordDialogOpen(false)} className="rounded-lg">Cancel</Button>
                  <Button variant="blue" onClick={handleResetPassword} disabled={saving} className="rounded-lg">
                    {saving ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete/Restore Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {companyToDelete?.delete_status === 0 ? 'Restore Company' : 'Deactivate Company'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {companyToDelete?.delete_status === 0
                      ? `Restore "${companyToDelete?.name}"? This will make the company active again.`
                      : `Deactivate "${companyToDelete?.name}"? The company will be soft deleted and can be restored later.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCompanyToDelete(null)} className="rounded-lg">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className={`rounded-lg ${companyToDelete?.delete_status === 0 ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}
                    disabled={saving}
                  >
                    {saving ? 'Processing...' : companyToDelete?.delete_status === 0 ? 'Restore' : 'Deactivate'}
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
