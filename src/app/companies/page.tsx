"use client"

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, MoreVertical, Pencil, Trash, Lock, Calendar, Clock, Users, Building2 } from 'lucide-react'
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
                <h1 className="text-2xl font-semibold">Manage Companies</h1>
                <p className="text-sm text-muted-foreground">
                  Create and manage companies in your system
                </p>
              </div>
              <div className="flex items-center gap-2">
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
                          <Label htmlFor="name">
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
                          Create Company
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {companies.map((company) => (
                <Card key={company.id} className="flex flex-col h-full">
                  <CardContent className="p-4 flex flex-col flex-1">
                    {/* Header with Plan Badge and Actions */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-blue-500 text-white">
                        {company.plan || 'No Plan'}
                      </Badge>
                      {company.is_active && company.is_enable_login ? (
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
                            <DropdownMenuItem>
                              <Trash className="mr-2 h-4 w-4" /> Delete
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
                      <Avatar className="h-16 w-16 border-2 border-primary">
                        <AvatarImage src={company.avatar} />
                        <AvatarFallback className="text-lg">
                          {getInitials(company.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold mb-1 truncate">{company.name}</h5>
                        {company.delete_status === 0 && (
                          <Badge variant="destructive" className="text-xs mb-1">Soft Deleted</Badge>
                        )}
                        <p className="text-sm text-muted-foreground truncate">{company.email}</p>
                      </div>
                    </div>

                    {/* Last Login Date & Time */}
                    <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b">
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
                      <Button variant="default" size="sm" className="flex-1 shadow-none">
                        Upgrade Plan
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 shadow-none">
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
                        <span className="text-sm font-medium">{company.total_users || 0}</span>
                      </div>
                      <div className="flex items-center gap-2" title="Customers">
                        <div className="h-8 w-8 rounded bg-green-500 flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">{company.total_customers || 0}</span>
                      </div>
                      <div className="flex items-center gap-2" title="Vendors">
                        <div className="h-8 w-8 rounded bg-purple-500 flex items-center justify-center">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">{company.total_vendors || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add New Company Card */}
              <Card className="border-2 border-dashed border-primary cursor-pointer hover:border-blue-500 transition-colors">
                <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
                  <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                    <DialogTrigger asChild>
                      <div className="flex flex-col items-center cursor-pointer">
                        <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center mb-4">
                          <Plus className="h-8 w-8 text-white" />
                        </div>
                        <h6 className="text-lg font-semibold mb-2">Create Company</h6>
                        <p className="text-sm text-muted-foreground text-center">
                          Click here to add new company
                        </p>
                      </div>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
