"use client"

import { useState } from 'react'
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
import { Plus, MoreVertical, Pencil, Trash, Lock, Calendar, Clock, Users, Building2, RotateCcw, LogIn, LogOut, ShoppingCart, Check } from 'lucide-react'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

// Types
interface Company {
  id: string
  name: string
  email: string
  avatar?: string
  plan?: string
  plan_expire_date?: string
  is_active: boolean
  is_enable_login: boolean
  last_login_at: string
  delete_status: number
  total_users?: number
  total_customers?: number
  total_vendors?: number
}

interface CompanyUser {
  id: string
  name: string
  avatar?: string
  is_disable: boolean
}

// Mock data for Super Admin - Companies
// Plan names disesuaikan dengan halaman /plans (Free Plan, Silver, Gold, Platinum)
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'admin@acme.com',
    plan: 'Platinum',
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
    plan: 'Gold',
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
    plan: 'Free Plan',
    // Tidak lifetime, gunakan tanggal expired seperti plan lain
    plan_expire_date: '2024-03-31',
    is_active: true,
    is_enable_login: false,
    last_login_at: '2024-01-13 09:15:00',
    delete_status: 1,
    total_users: 150,
    total_customers: 500,
    total_vendors: 100,
  },
]

// Opsi plan harus konsisten dengan mockPlans di halaman /plans
const plans = ['Free Plan', 'Silver', 'Gold', 'Platinum']

// Ringkasan plan untuk dialog Upgrade Plan (disamakan dengan /plans)
const planSummaries: Record<
  string,
  {
    price: number
    durationLabel: string
    max_users: number
    max_customers: number
    max_vendors: number
  }
> = {
  'Free Plan': {
    price: 0,
    durationLabel: 'lifetime',
    max_users: 5,
    max_customers: 5,
    max_vendors: 5,
  },
  Silver: {
    price: 250000,
    durationLabel: 'month',
    max_users: 20,
    max_customers: 100,
    max_vendors: 50,
  },
  Gold: {
    price: 750000,
    durationLabel: 'month',
    max_users: 50,
    max_customers: 500,
    max_vendors: 100,
  },
  Platinum: {
    price: 1500000,
    durationLabel: 'month',
    max_users: -1, // Unlimited
    max_customers: -1,
    max_vendors: -1,
  },
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    plan: '',
    password: '',
    login_enable: false,
  })
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [adminHubDialogOpen, setAdminHubDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  
  // Mock users untuk company (akan diambil dari API nanti)
  const [companyUsers, setCompanyUsers] = useState<Record<string, CompanyUser[]>>({
    '1': [
      { id: '1', name: 'Richard Atkinson', is_disable: false },
      { id: '2', name: 'Buffy Walter', is_disable: false },
      { id: '3', name: 'Fapor Slims', is_disable: false },
      { id: '4', name: 'Maia', is_disable: false },
      { id: '5', name: 'Ira Bradley', is_disable: false },
      { id: '6', name: 'Tamekah Wolfe', is_disable: false },
      { id: '7', name: 'Employee', is_disable: false },
      { id: '8', name: 'Sonya Sims', is_disable: false },
      { id: '9', name: 'Abel Callahan', is_disable: false },
      { id: '10', name: 'Antikstion Grum', is_disable: false },
      { id: '11', name: 'Anne George', is_disable: false },
      { id: '12', name: 'Kirsten Benson', is_disable: false },
      { id: '13', name: 'Curran Robles', is_disable: false },
    ],
    '2': [],
    '3': [],
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

  const handleConfirmDelete = () => {
    if (companyToDelete) {
      if (companyToDelete.delete_status === 0) {
        // Restore
        setCompanies(
          companies.map((c) =>
            c.id === companyToDelete.id ? { ...c, delete_status: 1 } : c
          )
        )
      } else {
        // Delete (soft delete)
        setCompanies(
          companies.map((c) =>
            c.id === companyToDelete.id ? { ...c, delete_status: 0 } : c
          )
        )
      }
      setDeleteDialogOpen(false)
      setCompanyToDelete(null)
    }
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
              <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="blue" className="shadow-none">
                    <Plus className="mr-2 h-4 w-4" /> Create Company
                  </Button>
                </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Company</DialogTitle>
                      <DialogDescription>
                        Add a new company to your system. Fill in the required information.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Company Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter Company Name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        <div className="space-y-2">
                          <Label htmlFor="plan" className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan</Label>
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
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Enter Password (optional)"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login_enable" className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Login</Label>
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
                          Create Company
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
            </div>

            {/* Companies Grid */}
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
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setCompanyToDelete(company)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" /> {company.delete_status === 0 ? 'Restore' : 'Delete'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Building2 className="mr-2 h-4 w-4" /> Login As Company
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RotateCcw className="mr-2 h-4 w-4" /> Reset Password
                          </DropdownMenuItem>
                          {company.is_enable_login ? (
                            <DropdownMenuItem className="text-destructive">
                              <LogOut className="mr-2 h-4 w-4" /> Login Disable
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600">
                              <LogIn className="mr-2 h-4 w-4" /> Login Enable
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Company Info */}
                    <div className="flex items-center gap-3 border-b pb-3 mb-3">
                      <Avatar className="h-16 w-16 border-2 border-blue-200">
                        <AvatarImage src={company.avatar} />
                        <AvatarFallback className="text-base bg-blue-100 text-blue-700">
                          {getInitials(company.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium mb-1 truncate">{company.name}</h5>
                        {company.delete_status === 0 && (
                          <Badge variant="destructive" className="text-xs mb-1">Soft Deleted</Badge>
                        )}
                        <p className="text-sm text-muted-foreground truncate">{company.email}</p>
                      </div>
                    </div>

                    {/* Last Login Date & Time - Separated */}
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
                        onClick={() => {
                          setSelectedCompany(company)
                          setAdminHubDialogOpen(true)
                        }}
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
                        <div className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-normal">{company.total_users || 0}</span>
                      </div>
                      <div className="flex items-center gap-2" title="Customers">
                        <div className="h-8 w-8 rounded bg-green-500 flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-normal">{company.total_customers || 0}</span>
                      </div>
                      <div className="flex items-center gap-2" title="Vendors">
                        <div className="h-8 w-8 rounded bg-purple-500 flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-normal">{company.total_vendors || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Dialog: Upgrade Plan */}
            <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Upgrade Plan</DialogTitle>
                  <DialogDescription>
                    Pilih plan baru untuk {selectedCompany?.name ?? ''}
                  </DialogDescription>
                </DialogHeader>
                {selectedCompany && (
                  <div className="space-y-3">
                    {plans.map((plan) => {
                      const planData = planSummaries[plan]
                      const isCurrentPlan = plan === selectedCompany.plan
                      const formatLimit = (limit: number) => (limit === -1 ? 'Unlimited' : limit.toString())
                      const formatDuration = (duration: string) => {
                        if (duration === 'lifetime') return 'lifetime'
                        if (duration === 'month') return 'month'
                        if (duration === 'year') return 'year'
                        return duration
                      }

                      return (
                        <div
                          key={plan}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium">{plan}</h4>
                              <span className="text-sm text-muted-foreground">
                                ({new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR',
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 0,
                                }).format(planData.price)} / {formatDuration(planData.durationLabel)})
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Users: {formatLimit(planData.max_users)}</span>
                              <span>Customers: {formatLimit(planData.max_customers)}</span>
                              <span>Vendors: {formatLimit(planData.max_vendors)}</span>
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
                                onClick={() => {
                                  // Update company plan
                                  setCompanies(
                                    companies.map((c) =>
                                      c.id === selectedCompany.id ? { ...c, plan: plan } : c
                                    )
                                  )
                                  setUpgradeDialogOpen(false)
                                  setSelectedCompany(null)
                                }}
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setUpgradeDialogOpen(false)
                      setSelectedCompany(null)
                    }}
                  >
                    Tutup
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog: Admin Hub (Company Info) */}
            <Dialog open={adminHubDialogOpen} onOpenChange={setAdminHubDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Company Info</DialogTitle>
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
                            <p className="text-xs font-medium text-muted-foreground">Total User</p>
                            <p className="text-lg font-medium">
                              {companyUsers[selectedCompany.id]?.length ?? 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Active User</p>
                            <p className="text-lg font-medium">
                              {companyUsers[selectedCompany.id]?.filter((u) => !u.is_disable).length ?? 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Disable User</p>
                            <p className="text-lg font-medium">
                              {companyUsers[selectedCompany.id]?.filter((u) => u.is_disable).length ?? 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User List */}
                    {companyUsers[selectedCompany.id] && companyUsers[selectedCompany.id].length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {companyUsers[selectedCompany.id].map((user) => (
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
                                setCompanyUsers((prev) => ({
                                  ...prev,
                                  [selectedCompany.id]: prev[selectedCompany.id].map((u) =>
                                    u.id === user.id ? { ...u, is_disable: !checked } : u
                                  ),
                                }))
                              }}
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
                    Tutup
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete/Restore Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {companyToDelete?.delete_status === 0 ? 'Restore Company' : 'Delete Company'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {companyToDelete?.delete_status === 0
                      ? `Are you sure you want to restore "${companyToDelete?.name}"? This will make the company active again.`
                      : `Are you sure you want to delete "${companyToDelete?.name}"? This action will soft delete the company and cannot be undone.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setCompanyToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    className={companyToDelete?.delete_status === 0 ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}
                  >
                    {companyToDelete?.delete_status === 0 ? 'Restore' : 'Delete'}
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

