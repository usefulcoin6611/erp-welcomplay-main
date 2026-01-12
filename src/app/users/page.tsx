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
import { Plus, MoreVertical, Pencil, Trash, Lock, Unlock, Calendar, Clock, UserCheck } from 'lucide-react'
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
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  type: string
  is_active: boolean
  is_enable_login: boolean
  last_login_at: string
  delete_status: number
}

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    type: 'Admin',
    is_active: true,
    is_enable_login: true,
    last_login_at: '2024-01-15 10:30:00',
    delete_status: 1,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    type: 'HR',
    is_active: true,
    is_enable_login: true,
    last_login_at: '2024-01-14 14:20:00',
    delete_status: 1,
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    type: 'Employee',
    is_active: true,
    is_enable_login: false,
    last_login_at: '2024-01-13 09:15:00',
    delete_status: 1,
  },
]

const roles = ['Admin', 'HR', 'Employee', 'Manager']

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    login_enable: false,
  })

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setFormData({
        name: '',
        email: '',
        role: '',
        password: '',
        login_enable: false,
      })
    }
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form data:', formData)
    // Reset form and close dialog
    setFormData({
      name: '',
      email: '',
      role: '',
      password: '',
      login_enable: false,
    })
    setDialogOpen(false)
  }

  const formatDate = (dateString: string) => {
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

  const getUserTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-700'
      case 'hr':
        return 'bg-blue-100 text-blue-700'
      case 'employee':
        return 'bg-green-100 text-green-700'
      case 'manager':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
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
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Manage User</h1>
                <p className="text-sm text-muted-foreground">
                  Create and manage users in your system
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="shadow-none">
                  <UserCheck className="mr-2 h-4 w-4" /> User Logs
                </Button>
                <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="blue" className="shadow-none">
                      <Plus className="mr-2 h-4 w-4" /> Create User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create User</DialogTitle>
                      <DialogDescription>
                        Add a new user to your system. Fill in the required information.
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
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                              placeholder="Enter User Name"
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
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                              placeholder="Enter User Email"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">
                            User Role <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value })}
                          >
                            <SelectTrigger id="role">
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role} value={role.toLowerCase()}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground mt-1">
                            Create role here. <span className="font-medium text-primary cursor-pointer">Create role</span>
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login_enable">Login is enable</Label>
                          <Switch
                            id="login_enable"
                            checked={formData.login_enable}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, login_enable: checked })
                            }
                          />
                        </div>
                        {formData.login_enable && (
                          <div className="space-y-2">
                            <Label htmlFor="password">
                              Password <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                              }
                              placeholder="Enter User Password"
                              minLength={6}
                              required
                            />
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="blue">Create</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* User Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {users.map((user) => (
                <Card key={user.id} className="shadow-none">
                  <CardContent className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getUserTypeColor(user.type)}>{user.type}</Badge>
                      {user.is_active && user.delete_status === 1 ? (
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
                            <DropdownMenuItem className="text-destructive">
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              {user.is_enable_login ? (
                                <>
                                  <Unlock className="mr-2 h-4 w-4" /> Login Disable
                                </>
                              ) : (
                                <>
                                  <Lock className="mr-2 h-4 w-4" /> Login Enable
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 pb-3 mb-3 border-b">
                      <Avatar className="h-16 w-16 border-2 border-blue-500">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold truncate">{user.name}</h5>
                        {user.delete_status === 0 && (
                          <p className="text-xs text-muted-foreground">Soft Deleted</p>
                        )}
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Last Login */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded bg-blue-100">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm">{formatDate(user.last_login_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded bg-blue-100">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm">{formatTime(user.last_login_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add New User Card */}
              <Card
                className="shadow-none border-dashed border-2 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => setDialogOpen(true)}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[280px] text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 mb-3">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h6 className="font-semibold mb-2">Create User</h6>
                  <p className="text-sm text-muted-foreground">
                    Click here to add new user
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


