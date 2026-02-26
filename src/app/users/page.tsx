"use client"

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { getPlanBadgeColors } from '@/lib/plan-badge-colors'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, MoreVertical, Pencil, Trash2, Lock, Calendar, Clock, UserCheck, Users, Building2, Shield } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

// Types
interface Company {
  id: string
  name: string
  email: string
  avatar?: string
  plan?: string
  plan_expire_date?: string | null
  is_active: boolean
  is_enable_login: boolean
  last_login_at: string
  delete_status: number
  total_users?: number
  total_customers?: number
  total_vendors?: number
}

type AppUser = {
  id: string
  name: string
  email: string
  avatar?: string
  type: string
  accessProfileId?: string | null
  accessProfileName?: string | null
  is_active: boolean
  is_enable_login: boolean
  delete_status: number
  created_at: string
  last_login_at: string
}

type RoleOption = { id: string; name: string }

const plans = ['Basic Plan', 'Premium Plan', 'Enterprise Plan', 'Lifetime']
const COMPANY_ROLE = 'company'
const EMPLOYEE_ROLE = 'employee'

// Store raw ISO from API; format in UI with formatDate/formatTime so we avoid Invalid Date

export default function UsersPage() {
  const { user, isLoading: authLoading } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'

  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: '',
    password: '',
    login_enable: true,
    role: EMPLOYEE_ROLE,
    accessProfileId: '',
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<Company | AppUser | null>(null)
  const [accessProfileOptions, setAccessProfileOptions] = useState<RoleOption[]>([])

  const fetchAccessProfiles = useCallback(async () => {
    try {
      const res = await fetch('/api/access-profiles')
      const json = await res.json().catch(() => null)
      if (res.ok && json?.success && Array.isArray(json.data)) {
        setAccessProfileOptions(json.data.map((r: { id: string; name: string }) => ({ id: r.id, name: r.name })))
      }
    } catch {
      // non-blocking
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const url = isSuperAdmin ? '/api/users?view=companies' : '/api/users'
      const res = await fetch(url)
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message ?? 'Failed to load users')
        return
      }
      const list = Array.isArray(json.data) ? json.data : []
      if (isSuperAdmin) {
        setCompanies(
          list.map((r: { id: string; name: string; email: string; lastLoginAt?: string | null; lastActivityAt?: string | null }) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            plan: 'No Plan',
            plan_expire_date: null,
            is_active: true,
            is_enable_login: true,
            last_login_at: r.lastLoginAt ?? r.lastActivityAt ?? '',
            delete_status: 1,
            total_users: 0,
            total_customers: 0,
            total_vendors: 0,
          }))
        )
      } else {
        setUsers(
          list.map((r: { id: string; name: string; email: string; role: string; accessProfileId?: string | null; accessProfileName?: string | null; createdAt?: string | null; lastLoginAt?: string | null; lastActivityAt?: string | null }) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            type: r.role,
            accessProfileId: r.accessProfileId ?? null,
            accessProfileName: r.accessProfileName ?? null,
            is_active: true,
            is_enable_login: true,
            delete_status: 1,
            created_at: r.createdAt ?? '',
            last_login_at: r.lastLoginAt ?? r.lastActivityAt ?? '',
          }))
        )
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [isSuperAdmin])

  // Wait for auth to be ready so isSuperAdmin and API URL are correct, then fetch
  useEffect(() => {
    if (authLoading) return
    fetchUsers()
  }, [authLoading, fetchUsers])

  useEffect(() => {
    if (authLoading || isSuperAdmin) return
    fetchAccessProfiles()
  }, [authLoading, isSuperAdmin, fetchAccessProfiles])

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (open && !isSuperAdmin) fetchAccessProfiles()
    if (!open) {
      setEditingId(null)
      setFormData({
        name: '',
        email: '',
        plan: '',
        password: '',
        login_enable: true,
        role: EMPLOYEE_ROLE,
        accessProfileId: '',
      })
    }
  }

  const handleEdit = (item: Company | AppUser) => {
    setEditingId(item.id)
    setFormData({
      name: item.name,
      email: item.email,
      plan: '',
      password: '',
      login_enable: true,
      role: isSuperAdmin ? COMPANY_ROLE : EMPLOYEE_ROLE,
      accessProfileId: 'accessProfileId' in item && item.accessProfileId ? item.accessProfileId : '',
    })
    setDialogOpen(true)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim() || !formData.email?.trim()) {
      toast.error('Name and email are required')
      return
    }
    // /users page only manages employees (and companies for super admin); clients are on /clients
    const role = isSuperAdmin ? COMPANY_ROLE : EMPLOYEE_ROLE

    setSaving(true)
    try {
      const url = editingId ? `/api/users/${editingId}` : '/api/users'
      const method = editingId ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role,
      }
      if (formData.password?.trim()) body.password = formData.password.trim()
      if (!isSuperAdmin) body.accessProfileId = formData.accessProfileId?.trim() || null

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message ?? (editingId ? 'Failed to update user' : 'Failed to create user'))
        return
      }
      toast.success(editingId ? 'User updated' : 'User created')
      handleDialogOpenChange(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
      toast.error(editingId ? 'Failed to update user' : 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const openDeleteConfirm = (item: Company | AppUser) => {
    setUserToDelete(item)
    // Defer so the dropdown menu can close first and release focus; avoids aria-hidden/focus conflict
    requestAnimationFrame(() => {
      setDeleteDialogOpen(true)
    })
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return
    const idToDelete = userToDelete.id
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${idToDelete}`, { method: 'DELETE' })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.success) {
        toast.error(json?.message ?? 'Failed to delete user')
        return
      }
      toast.success('User deleted')
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      await fetchUsers()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete user')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (isoOrEmpty: string) => {
    if (!isoOrEmpty) return '-'
    const date = new Date(isoOrEmpty)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const formatTime = (isoOrEmpty: string) => {
    if (!isoOrEmpty) return '-'
    const date = new Date(isoOrEmpty)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const formatExpireDate = (date: string | null | undefined) => {
    if (!date) return 'Lifetime'
    const expireDate = new Date(date)
    return expireDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const filteredUsers = users

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
            {loading ? (
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardContent className="p-8 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading users...</p>
                </CardContent>
              </Card>
            ) : (
              <>
            {/* Title Page */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 space-y-1 flex-1">
                  <CardTitle className="text-lg font-semibold">
                    {isSuperAdmin ? 'Manage Companies' : 'Manage User'}
                  </CardTitle>
                  <CardDescription>
                    {isSuperAdmin 
                      ? 'Create and manage companies in your system. Monitor company plans, users, and activity.'
                      : 'Create and manage users in your system. Set user type (Employee/Client) and optionally an access profile (permission set).'}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {!isSuperAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-none h-7 px-4 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                      title="User Logs"
                      asChild
                    >
                      <Link href="/userlogs">
                        <UserCheck className="mr-2 h-3 w-3" />
                        User Logs
                      </Link>
                    </Button>
                  )}
                  <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                    <DialogTrigger asChild>
                      <Button variant="blue" size="sm" className="shadow-none h-7 px-4" title={isSuperAdmin ? 'Create Company' : 'Create User'}>
                        <Plus className="mr-2 h-3 w-3" />
                        {isSuperAdmin ? 'Create Company' : 'Create User'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingId
                          ? isSuperAdmin
                            ? 'Edit Company'
                            : 'Edit User'
                          : isSuperAdmin
                            ? 'Create Company'
                            : 'Create User'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            {isSuperAdmin ? 'Company Name' : 'Name'} <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={isSuperAdmin ? 'Enter Company Name' : 'Enter Name'}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter Email"
                            required
                            disabled={!!editingId}
                          />
                        </div>
                        {!isSuperAdmin && (
                          <div className="space-y-2">
                            <Label>Access Profile</Label>
                              <Select
                                value={formData.accessProfileId || '_none'}
                                onValueChange={(value) => setFormData({ ...formData, accessProfileId: value === '_none' ? '' : value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="None (no permission set)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="_none">None</SelectItem>
                                  {accessProfileOptions.map((r: RoleOption) => (
                                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                        )}
                        {isSuperAdmin && (
                          <div className="space-y-2">
                            <Label htmlFor="plan">Plan</Label>
                            <Select
                              value={formData.plan}
                              onValueChange={(value) => setFormData({ ...formData, plan: value })}
                            >
                              <SelectTrigger id="plan">
                                <SelectValue placeholder="Select Plan" />
                              </SelectTrigger>
                              <SelectContent>
                                {plans.map((plan) => (
                                  <SelectItem key={plan} value={plan}>
                                    {plan}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Enter Password (optional)"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login_enable">Enable Login</Label>
                          <Switch
                            id="login_enable"
                            checked={formData.login_enable}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, login_enable: checked })
                            }
                            className="data-[state=checked]:bg-blue-600"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleDialogOpenChange(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="blue" className="shadow-none" disabled={saving}>
                          {saving ? 'Saving...' : editingId ? 'Update' : isSuperAdmin ? 'Create Company' : 'Create User'}
                        </Button>
                      </DialogFooter>
                    </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Companies Grid (Super Admin) */}
            {isSuperAdmin ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {companies.map((company) => (
                  <Card
                    key={company.id}
                    className="flex flex-col h-full rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] hover:shadow-[0_2px_4px_0_rgb(0_0_0_/_0.05)] transition-shadow"
                  >
                    <CardContent className="p-6 flex flex-col flex-1">
                      {/* Header with Plan Badge and Actions */}
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getPlanBadgeColors(company.plan || 'No Plan')}>
                          {company.plan || 'No Plan'}
                        </Badge>
                        {company.is_active && company.is_enable_login ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(company)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteConfirm(company)}>
                                <Trash2 className="mr-2 h-4 w-4" /> {company.delete_status !== 0 ? 'Delete' : 'Restore'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Building2 className="mr-2 h-4 w-4" /> Login As Company
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Lock className="mr-2 h-4 w-4" /> Reset Password
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      {/* Company Info */}
                      <div className="flex items-center gap-3 border-b pb-3 mb-3">
                        <Avatar className="h-14 w-14 border-2 border-primary">
                          <AvatarImage src={company.avatar} />
                          <AvatarFallback className="text-lg">
                            {getInitials(company.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold mb-1 truncate">{company.name}</h5>
                          {company.delete_status === 0 && (
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs mb-1">Soft Deleted</Badge>
                          )}
                          <p className="text-sm text-muted-foreground truncate">{company.email}</p>
                        </div>
                      </div>

                      {/* Last Login Date & Time */}
                      <div className="mb-3 pb-3 border-b">
                        <p className="text-xs text-muted-foreground mb-2">Last Login</p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm">{formatDate(company.last_login_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm">{formatTime(company.last_login_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 border-b border-t py-3 my-3">
                        <Button variant="blue" size="sm" className="flex-1 shadow-none">
                          Upgrade Plan
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          Admin Hub
                        </Button>
                      </div>

                      {/* Plan Expire Date */}
                      <div className="text-center pb-3 mb-3 border-b">
                        <p className="text-xs text-muted-foreground mb-1">Plan Expired</p>
                        <span className="text-sm font-medium">
                          {formatExpireDate(company.plan_expire_date)}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2" title="Users">
                          <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium">{company.total_users || 0}</span>
                        </div>
                        <div className="flex items-center gap-2" title="Customers">
                          <div className="h-8 w-8 rounded bg-green-50 flex items-center justify-center">
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium">{company.total_customers || 0}</span>
                        </div>
                        <div className="flex items-center gap-2" title="Vendors">
                          <div className="h-8 w-8 rounded bg-purple-50 flex items-center justify-center">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium">{company.total_vendors || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              </div>
            ) : (
              /* Users Table (Company/HR) */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredUsers.map((u) => (
                    <Card
                      key={u.id}
                      className="group flex flex-col h-full rounded-xl border-0 shadow-sm overflow-hidden bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/70 hover:shadow-md transition-all duration-200"
                    >
                      <CardContent className="p-3 flex flex-col flex-1 gap-2">
                        {/* Top: avatar + name/email + menu — pastel block */}
                        <div className="flex items-start gap-3 rounded-xl bg-white/80 backdrop-blur-sm px-4 py-3">
                          <Avatar className="h-14 w-14 shrink-0 rounded-full ring-2 ring-blue-200/50 ring-offset-2 bg-gradient-to-br from-blue-100 to-blue-200/60">
                            <AvatarImage src={u.avatar} alt={u.name} className="object-cover" />
                            <AvatarFallback className="rounded-full text-base font-semibold bg-blue-400/20 text-blue-700">
                              {getInitials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-[15px] truncate leading-tight">{u.name}</h5>
                            <p className="text-sm text-muted-foreground truncate mt-0.5">{u.email}</p>
                            <div className="flex items-center gap-1.5 mt-2" title="Access profile">
                              <Shield className="h-4 w-4 shrink-0 text-blue-600" />
                              <span className="text-sm truncate">{u.accessProfileName || 'None'}</span>
                            </div>
                            {u.delete_status === 0 && (
                              <span className="inline-block mt-1.5 text-xs text-red-600 font-medium">Soft deleted</span>
                            )}
                          </div>
                          {u.is_active && u.is_enable_login ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg opacity-70 group-hover:opacity-100">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(u)}>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openDeleteConfirm(u)}>
                                  <Trash2 className="mr-2 h-4 w-4" /> {u.delete_status !== 0 ? 'Delete' : 'Restore'}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Lock className="mr-2 h-4 w-4" /> Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <UserCheck className="mr-2 h-4 w-4" /> {u.is_enable_login ? 'Login Disable' : 'Login Enable'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
                          )}
                        </div>

                        {/* Account Created — pastel block, icon kept */}
                        <div className="flex items-center gap-3 rounded-xl bg-blue-100/40 px-4 py-2.5" title="Account created">
                          <Calendar className="h-5 w-5 shrink-0 text-blue-600" />
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span className="text-xs text-muted-foreground">Account Created</span>
                            <span className="text-sm tabular-nums">{formatDate(u.created_at)}</span>
                          </div>
                        </div>

                        {/* Last Login — pastel block, icon kept */}
                        <div className="flex items-center gap-3 rounded-xl bg-blue-100/40 px-4 py-2.5" title="Last login">
                          <Clock className="h-5 w-5 shrink-0 text-blue-600" />
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span className="text-xs text-muted-foreground">Last Login</span>
                            <span className="text-sm tabular-nums">
                              {formatDate(u.last_login_at)} {formatTime(u.last_login_at) !== '-' ? formatTime(u.last_login_at) : ''}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                </div>
              </div>
            )}

            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={(open) => {
                setDeleteDialogOpen(open)
                if (!open) setUserToDelete(null)
              }}
            >
              <AlertDialogContent
                onCloseAutoFocus={(e) => {
                  e.preventDefault()
                }}
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete user?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the user{' '}
                    {userToDelete ? (userToDelete as { name?: string }).name ?? userToDelete.email : ''}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
                  <Button
                    type="button"
                    variant="destructive"
                    className="bg-destructive text-white hover:bg-destructive/90"
                    disabled={saving}
                    onClick={() => void handleConfirmDelete()}
                  >
                    {saving ? 'Deleting...' : 'Delete'}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
              </>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

