"use client"

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, MoreVertical, Pencil, Trash, Lock, Unlock, Calendar, Clock } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'

// Types
interface Client {
  id: string
  name: string
  email: string
  avatar?: string
  is_enable_login: boolean
  last_login_at: string
  delete_status: number
  deals_count: number
  projects_count: number
}

// Mock data
const mockClients: Client[] = [
  {
    id: '1',
    name: 'PT Maju Jaya',
    email: 'contact@majujaya.com',
    is_enable_login: true,
    last_login_at: '2024-01-15 10:30:00',
    delete_status: 1,
    deals_count: 5,
    projects_count: 3,
  },
  {
    id: '2',
    name: 'CV Kreatif Digital',
    email: 'info@kreatifdigital.com',
    is_enable_login: true,
    last_login_at: '2024-01-14 14:20:00',
    delete_status: 1,
    deals_count: 2,
    projects_count: 1,
  },
  {
    id: '3',
    name: 'PT Teknologi Indonesia',
    email: 'hello@teknologi.id',
    is_enable_login: false,
    last_login_at: '2024-01-13 09:15:00',
    delete_status: 1,
    deals_count: 8,
    projects_count: 5,
  },
]

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    login_enable: false,
  })

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setFormData({
        name: '',
        email: '',
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
                <h1 className="text-2xl font-semibold">Manage Client</h1>
                <p className="text-sm text-muted-foreground">
                  Create and manage clients in your system
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="blue" className="shadow-none">
                    <Plus className="mr-2 h-4 w-4" /> Create Client
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Client</DialogTitle>
                    <DialogDescription>
                      Add a new client to your system. Fill in the required information.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSubmit}>
                    <div className="grid gap-4 py-4">
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
                          placeholder="Enter Client Name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          E-Mail Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="Enter Client Email"
                          required
                        />
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
                            placeholder="Enter Client Password"
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

            {/* Client Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {clients.map((client) => (
                <Card key={client.id} className="shadow-none">
                  <CardContent className="p-4">
                    {/* Client Info */}
                    <div className="flex items-center gap-3 pb-3 mb-3 border-b">
                      <Avatar className="h-16 w-16 border-2 border-blue-500">
                        <AvatarImage src={client.avatar} alt={client.name} />
                        <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-semibold truncate flex-1">{client.name}</h5>
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
                                <Trash className="mr-2 h-4 w-4" />{' '}
                                {client.delete_status === 0 ? 'Restore' : 'Delete'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {client.is_enable_login ? (
                                  <>
                                    <Unlock className="mr-2 h-4 w-4" /> Login Disable
                                  </>
                                ) : (
                                  <>
                                    <Lock className="mr-2 h-4 w-4" /> Login Enable
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Lock className="mr-2 h-4 w-4" /> Reset Password
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                      </div>
                    </div>

                    {/* Deals and Projects */}
                    <div className="flex items-center justify-between gap-3 pb-3 mb-3 border-b">
                      <div className="flex-1">
                        <span className="text-sm font-medium">Deals: </span>
                        <span className="text-sm">{client.deals_count}</span>
                      </div>
                      <div className="flex-1 text-end">
                        <span className="text-sm font-medium">Projects: </span>
                        <span className="text-sm">{client.projects_count}</span>
                      </div>
                    </div>

                    {/* Last Login */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded bg-blue-100">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm">{formatDate(client.last_login_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center h-8 w-8 rounded bg-blue-100">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm">{formatTime(client.last_login_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add New Client Card */}
              <Card
                className="shadow-none border-dashed border-2 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => setDialogOpen(true)}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[280px] text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-500 mb-3">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h6 className="font-semibold mb-2">Create Client</h6>
                  <p className="text-sm text-muted-foreground">
                    Click here to add new client
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


