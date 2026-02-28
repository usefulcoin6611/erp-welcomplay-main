"use client"

import { useState, useEffect, useCallback } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { getPlanBadgeColors } from '@/lib/plan-badge-colors'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, MoreVertical, Pencil, Trash, Lock, Calendar, Clock, Users, Building2, RotateCcw, LogIn, LogOut, ShoppingCart, Check, Search } from 'lucide-react'
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

// Types
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

  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [adminHubDialogOpen, setAdminHubDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)

  // Selected company
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)

  // Form data
  const [formData, setFormData] = useState(defaultFormData)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [newPassword, setNewPassword] = useState('')

  // Plans from API
  const [availablePlans, setAvailablePlans] = useState<{ id: string; name: string; price: number; duration: string; max_users: number; max_customers: number; max_venders: number }[]>([])

  // Company users for Admin Hub
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
      if (json.success && Array.isArray(json.data)) {
        setAvailablePlans(json.data)
      }
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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password || null,
          plan: (formData.plan && formData.plan !== 'none') ? formData.plan : null,
          planExpireDate: formData.planExpireDate || null,
          isEnableLogin: formData.isEnableLogin,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to create company')
        return
      }
      toast.success('Company created successfully')
      setCreateDialogOpen(false)
      setFormData(defaultFormData)
      setFormErrors({})
      await loadCompanies()
    } catch {
      toast.error('Failed to create company')
    } finally {
      setSaving(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompany || !validateForm()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password || null,
          plan: (formData.plan && formData.plan !== 'none') ? formData.plan : null,
          planExpireDate: formData.planExpireDate || null,
          isEnableLogin: formData.isEnableLogin,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to update company')
        return
      }
      toast.success('Company updated successfully')
      setEditDialogOpen(false)
      setSelectedCompany(null)
      setFormData(defaultFormData)
      setFormErrors({})
      await loadCompanies()
    } catch {
      toast.error('Failed to update company')
    } finally {
      setSaving(false)
    }
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
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to update login status')
        return
      }
      // Optimistic update
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_enable_login: !c.is_enable_login } : c))
      toast.success(`Login ${!company.is_enable_login ? 'enabled' : 'disabled'} for ${company.name}`)
    } catch {
      toast.error('Failed to update login status')
    }
  }

  const handleResetPassword = async () => {
    if (!selectedCompany || !newPassword) {
      toast.error('New password is required')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to reset password')
        return
      }
      toast.success('Password reset successfully')
      setResetPasswordDialogOpen(false)
      setNewPassword('')
      setSelectedCompany(null)
    } catch {
      toast.error('Failed to reset password')
    } finally {
      setSaving(false)
    }
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
      if (!res.ok || !json.success) {
        toast.error(json.message || 'Failed to upgrade plan')
        return
      }
      toast.success(`Plan upgraded to ${planName} successfully`)
      setUpgradeDialogOpen(false)
      setSelectedCompany(null)
      await loadCompanies()
    } catch {
      toast.error('Failed to upgrade plan')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!companyToDelete) return
    setSaving(true)
    try {
      if (companyToDelete.delete_status === 0) {
        // Restore: set isActive = true
        const res = await fetch(`/api/companies/${companyToDelete.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: true }),
        })
        const json = await res.json()
        if (!res.ok || !json.success) {
          toast.error(json.message || 'Failed to restore company')
          return
        }
        toast.success('Company restored successfully')
      } else {
        // Soft delete
        const res = await fetch(`/api/companies/${companyToDelete.id}`, { method: 'DELETE' })
        const json = await res.json()
        if (!res.ok || !json.success) {
          toast.error(json.message || 'Failed to delete company')
          return
        }
        toast.success('Company deactivated successfully')
      }
      setDeleteDialogOpen(false)
      setCompanyToDelete(null)
      await loadCompanies()
    } catch {
      toast.error('Failed to process request')
    } finally {
      setSaving(false)
    }
  }

  const handleOpenAdminHub = async (company: Company) => {
    setSelectedCompany(company)
    setAdminHubDialogOpen(true)
    setLoadingUsers(true)
    try {
      // Fetch users for this company's branch
      const res = await fetch(`/api/users?branchId=${company.branchId}`, { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setCompanyUsers(json.data.map((u: any) => ({
          id: u.id,
          name: u.name || u.email,
          avatar: u.image,
          is_disable: false,
        })))
      }
    } catch {
      setCompanyUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const formatExpireDate = (date: string | null | undefined) => {
    if (!date) return 'Lifetime'
    const expireDate = new Date(date)
    return expireDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free'
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
  }

  const formatLimit = (limit: number) => limit === -1 ? 'Unlimited' : limit.toString()

  // Shared form fields
  const CompanyFormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="space-y-1.5">
        <Label htmlFor="c-name">Company Name <span className="text-red-500">*</span></Label>
        <Input
          id="c-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Acme Corporation"
          className={formErrors.name ? 'border-red-500' : ''}
        />
        {formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-email">Email <span className="text-red-500">*</span></Label>
        <Input
          id="c-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="admin@company.com"
          className={formErrors.email ? 'border-red-500' : ''}
        />
        {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="c-plan">Plan</Label>
          <Select value={formData.plan} onValueChange={(v) => setFormData({ ...formData, plan: v })}>
            <SelectTrigger id="c-plan">
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
          <Label htmlFor="c-expire">Plan Expire Date</Label>
          <Input
            id="c-expire"
            type="date"
            value={formData.planExpireDate}
            onChange={(e) => setFormData({ ...formData, planExpireDate: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-password">Password {selectedCompany ? '(leave blank to keep current)' : ''}</Label>
        <Input
          id="c-password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder={selectedCompany ? 'Leave blank to keep current' : 'Enter password (min 6 chars)'}
          className={formErrors.password ? 'border-red-500' : ''}
        />
        {formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
      </div>
      <div className="flex items-center justify-between p-3 border rounded-md">
        <Label htmlFor="c-login" className="cursor-pointer">Enable Login</Label>
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
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 bg-white shadow-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={showDeleted}
                    onCheckedChange={setShowDeleted}
                    className="data-[state=checked]:bg-blue-500"
                  />
                  <Label className="text-sm text-muted-foreground cursor-pointer" onClick={() => setShowDeleted(!showDeleted)}>
                    Show Deleted
                  </Label>
                </div>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={(open) => {
                setCreateDialogOpen(open)
                if (!open) { setFormData(defaultFormData); setFormErrors({}) }
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="blue" className="shadow-none shrink-0">
                    <Plus className="mr-2 h-4 w-4" /> Create Company
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Company</DialogTitle>
                    <DialogDescription>Add a new company to your system.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubmit}>
                    <CompanyFormFields />
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" variant="blue" disabled={saving}>
                        {saving ? 'Creating...' : 'Create Company'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading companies...</p>
              </div>
            )}

            {/* Companies Grid */}
            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {companies.map((company) => (
                  <Card key={company.id} className="flex flex-col h-full">
                    <CardContent className="p-4 flex flex-col flex-1">
                      {/* Header with Plan Badge and Actions */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getPlanBadgeColors(company.plan || 'No Plan')}>
                          {company.plan || 'No Plan'}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(company)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setCompanyToDelete(company)
                                setDeleteDialogOpen(true)
                              }}
                              className={company.delete_status === 0 ? 'text-green-600' : 'text-destructive'}
                            >
                              {company.delete_status === 0 ? (
                                <><RotateCcw className="mr-2 h-4 w-4" /> Restore</>
                              ) : (
                                <><Trash className="mr-2 h-4 w-4" /> Delete</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleOpenAdminHub(company)}>
                              <Building2 className="mr-2 h-4 w-4" /> Admin Hub
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedCompany(company)
                              setNewPassword('')
                              setResetPasswordDialogOpen(true)
                            }}>
                              <Lock className="mr-2 h-4 w-4" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleToggleLogin(company)}
                              className={company.is_enable_login ? 'text-destructive' : 'text-green-600'}
                            >
                              {company.is_enable_login ? (
                                <><LogOut className="mr-2 h-4 w-4" /> Disable Login</>
                              ) : (
                                <><LogIn className="mr-2 h-4 w-4" /> Enable Login</>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Company Info */}
                      <div className="flex items-center gap-3 border-b pb-3 mb-3">
                        <Avatar className="h-16 w-16 border-2 border-blue-200">
                          <AvatarImage src={company.avatar ?? undefined} />
                          <AvatarFallback className="text-base bg-blue-100 text-blue-700">
                            {getInitials(company.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium mb-1 truncate">{company.name}</h5>
                          {company.delete_status === 0 && (
                            <Badge variant="destructive" className="text-xs mb-1">Deactivated</Badge>
                          )}
                          {!company.is_enable_login && (
                            <Badge variant="outline" className="text-xs mb-1 bg-orange-50 text-orange-700 border-orange-200">Login Disabled</Badge>
                          )}
                          <p className="text-sm text-muted-foreground truncate">{company.email}</p>
                        </div>
                      </div>

                      {/* Last Login Date & Time */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm">{formatDate(company.last_login_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm">{formatTime(company.last_login_at)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 border-b border-t py-3 my-3">
                        <Button
                          variant="blue"
                          size="sm"
                          className="flex-1 shadow-none"
                          onClick={() => {
                            setSelectedCompany(company)
                            setUpgradeDialogOpen(true)
                          }}
                        >
                          Upgrade Plan
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 shadow-none"
                          onClick={() => handleOpenAdminHub(company)}
                        >
                          Admin Hub
                        </Button>
                      </div>

                      {/* Plan Expire Date */}
                      <div className="text-center pb-3 mb-3 border-b">
                        <span className="text-sm text-muted-foreground">
                          Plan Expired: {formatExpireDate(company.plan_expire_date)}
                        </span>
                      </div>

                      {/* Branch info */}
                      <div className="text-center">
                        <span className="text-xs text-muted-foreground">
                          Branch: {company.branchName || '-'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {companies.length === 0 && !loading && (
                  <div className="col-span-4 text-center py-12 text-muted-foreground">
                    No companies found.
                  </div>
                )}
              </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => {
              setEditDialogOpen(open)
              if (!open) { setSelectedCompany(null); setFormData(defaultFormData); setFormErrors({}) }
            }}>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Company</DialogTitle>
                  <DialogDescription>Update company information.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditSubmit}>
                  <CompanyFormFields />
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="blue" disabled={saving}>
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Upgrade Plan</DialogTitle>
                  <DialogDescription>
                    Select a new plan for {selectedCompany?.name ?? ''}
                  </DialogDescription>
                </DialogHeader>
                {selectedCompany && (
                  <div className="space-y-3">
                    {availablePlans.map((plan) => {
                      const isCurrentPlan = plan.name === selectedCompany.plan
                      return (
                        <div
                          key={plan.id}
                          className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                            isCurrentPlan ? 'border-green-300 bg-green-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-medium">{plan.name}</h4>
                              <span className="text-sm text-muted-foreground">
                                ({formatPrice(plan.price)}{plan.duration !== 'lifetime' ? `/${plan.duration}` : ''})
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Users: {formatLimit(plan.max_users)}</span>
                              <span>Customers: {formatLimit(plan.max_customers)}</span>
                              <span>Vendors: {formatLimit(plan.max_venders)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            {isCurrentPlan ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0 bg-green-500 hover:bg-green-600 text-white border-green-500"
                                disabled
                              >
                                <Check className="h-5 w-5" />
                              </Button>
                            ) : (
                              <Button
                                variant="blue"
                                size="sm"
                                className="h-10 w-10 p-0 shadow-none"
                                onClick={() => handleUpgradePlan(plan.name)}
                                disabled={saving}
                              >
                                <ShoppingCart className="h-5 w-5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => { setUpgradeDialogOpen(false); setSelectedCompany(null) }}>
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
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Admin Hub — {selectedCompany?.name}</DialogTitle>
                </DialogHeader>
                {selectedCompany && (
                  <div className="space-y-6">
                    {/* Summary cards */}
                    <div className="bg-white rounded-lg border p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Total Users</p>
                            <p className="text-lg font-medium">{companyUsers.length}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Active Users</p>
                            <p className="text-lg font-medium">{companyUsers.filter(u => !u.is_disable).length}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Disabled Users</p>
                            <p className="text-lg font-medium">{companyUsers.filter(u => u.is_disable).length}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User List */}
                    {loadingUsers ? (
                      <div className="text-center py-8 text-muted-foreground">Loading users...</div>
                    ) : companyUsers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {companyUsers.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center justify-between p-3 border border-green-200 rounded-lg bg-white"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Avatar className="h-10 w-10 border-2 border-green-200">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="bg-green-100 text-green-700 text-sm">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-normal text-sm">{user.name}</span>
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
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No users found for this company</p>
                      </div>
                    )}
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAdminHubDialogOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={resetPasswordDialogOpen} onOpenChange={(open) => {
              setResetPasswordDialogOpen(open)
              if (!open) { setSelectedCompany(null); setNewPassword('') }
            }}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Set a new password for {selectedCompany?.name}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setResetPasswordDialogOpen(false)}>Cancel</Button>
                  <Button variant="blue" onClick={handleResetPassword} disabled={saving}>
                    {saving ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete/Restore Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {companyToDelete?.delete_status === 0 ? 'Restore Company' : 'Deactivate Company'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {companyToDelete?.delete_status === 0
                      ? `Are you sure you want to restore "${companyToDelete?.name}"? This will make the company active again.`
                      : `Are you sure you want to deactivate "${companyToDelete?.name}"? The company will be soft deleted and can be restored later.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCompanyToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className={companyToDelete?.delete_status === 0 ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
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
