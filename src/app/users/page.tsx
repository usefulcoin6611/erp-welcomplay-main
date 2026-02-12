"use client"

import { useState } from 'react'
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
import { Plus, MoreVertical, Pencil, Trash2, Lock, Calendar, Clock, UserCheck, Users, Building2 } from 'lucide-react'
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
  is_active: boolean
  is_enable_login: boolean
  delete_status: number
  last_login_at: string
}

// Mock data for Super Admin - Companies
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'admin@acme.com',
    plan: 'Premium Plan',
    plan_expire_date: '2024-12-31',
    is_active: true,
    is_enable_login: true,
    last_login_at: '2024-01-15 10:30:00',
    delete_status: 1,
    total_users: 45,
    total_customers: 120,
    total_vendors: 35,
  },
  {
    id: '2',
    name: 'Tech Solutions Inc',
    email: 'admin@techsolutions.com',
    plan: 'Basic Plan',
    plan_expire_date: '2024-06-30',
    is_active: true,
    is_enable_login: true,
    last_login_at: '2024-01-14 14:20:00',
    delete_status: 1,
    total_users: 25,
    total_customers: 80,
    total_vendors: 20,
  },
  {
    id: '3',
    name: 'Global Enterprises',
    email: 'admin@global.com',
    plan: 'Enterprise Plan',
    plan_expire_date: null, // Lifetime
    is_active: true,
    is_enable_login: false,
    last_login_at: '2024-01-13 09:15:00',
    delete_status: 1,
    total_users: 150,
    total_customers: 500,
    total_vendors: 100,
  },
]

const plans = ['Basic Plan', 'Premium Plan', 'Enterprise Plan', 'Lifetime']

const mockUsers: AppUser[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@company.com',
    type: 'Admin',
    is_active: true,
    is_enable_login: true,
    delete_status: 1,
    last_login_at: '2025-01-15 10:30:00',
  },
  {
    id: 'u2',
    name: 'Staff User',
    email: 'staff@company.com',
    type: 'Staff',
    is_active: true,
    is_enable_login: true,
    delete_status: 1,
    last_login_at: '2025-01-14 14:20:00',
  },
  {
    id: 'u3',
    name: 'HR User',
    email: 'hr@company.com',
    type: 'HR',
    is_active: false,
    is_enable_login: false,
    delete_status: 1,
    last_login_at: '2025-01-13 09:15:00',
  },
]

export default function UsersPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.type === 'super admin'
  
  const [companies, setCompanies] = useState<Company[]>(mockCompanies)
  const [users, setUsers] = useState<AppUser[]>(mockUsers)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: '',
    password: '',
    login_enable: false,
  })

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setFormData({
        name: '',
        email: '',
        plan: '',
        password: '',
        login_enable: false,
      })
    }
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form data:', formData)
    handleDialogOpenChange(false)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString.split(' ')[0])
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  const formatTime = (dateString: string) => {
    const time = dateString.split(' ')[1] || '00:00:00'
    return time.substring(0, 5)
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
                      : 'Create and manage users in your system. Assign roles and permissions to control access.'}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {!isSuperAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-none h-7 px-4 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                      title="User Logs"
                    >
                      <UserCheck className="mr-2 h-3 w-3" />
                      User Logs
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
                      <DialogTitle>{isSuperAdmin ? 'Create Company' : 'Create User'}</DialogTitle>
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
                          />
                        </div>
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
                        <Button type="submit" variant="blue" className="shadow-none">
                          {isSuperAdmin ? 'Create Company' : 'Create User'}
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
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
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
                      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b">
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
                        <span className="text-sm text-muted-foreground">
                          Plan Expired : {formatExpireDate(company.plan_expire_date)}
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
                      className="flex flex-col h-full rounded-lg border border-gray-200 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] hover:shadow-[0_2px_4px_0_rgb(0_0_0_/_0.05)] transition-shadow"
                    >
                      <CardContent className="p-6 flex flex-col flex-1">
                        {/* Header with Type Badge and Actions */}
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                            {u.type}
                          </Badge>
                          {u.is_active && u.is_enable_login ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Pencil className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (
                                      confirm(
                                        'Are You Sure? This action can not be undone. Do you want to continue?',
                                      )
                                    ) {
                                      setUsers((prev) => prev.filter((x) => x.id !== u.id))
                                    }
                                  }}
                                >
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
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-3 border-b pb-3 mb-3">
                          <Avatar className="h-14 w-14 border-2 border-blue-500">
                            <AvatarImage src={u.avatar} />
                            <AvatarFallback className="text-lg">{getInitials(u.name)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold mb-1 truncate">{u.name}</h5>
                            {u.delete_status === 0 && (
                              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs mb-1">
                                Soft Deleted
                              </Badge>
                            )}
                            <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                          </div>
                        </div>

                        {/* Last Login Date & Time */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center h-8 w-8 rounded bg-blue-50">
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm">{formatDate(u.last_login_at)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center h-8 w-8 rounded bg-blue-50">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm">{formatTime(u.last_login_at)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                </div>
              </div>
            )}
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

