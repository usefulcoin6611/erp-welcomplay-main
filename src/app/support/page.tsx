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
import {
  Plus,
  Pencil,
  Trash,
  Calendar,
  LayoutGrid,
  Download,
  Eye,
  Reply,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  PauseCircle,
  Ticket as TicketIcon,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

// Types
interface Support {
  id: string
  created_by: {
    name: string
    avatar?: string
  }
  subject: string
  ticket_code: string
  attachment?: string
  assign_user?: string
  status: 'Open' | 'On Hold' | 'Close'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  created_at: string
  has_unread_reply: boolean
}

// Mock data
const mockSupports: Support[] = [
  {
    id: '1',
    created_by: {
      name: 'John Doe',
      avatar: '',
    },
    subject: 'Cannot login to system',
    ticket_code: 'TKT-001',
    attachment: '',
    assign_user: 'Admin User',
    status: 'Open',
    priority: 'High',
    created_at: '2024-01-15',
    has_unread_reply: true,
  },
  {
    id: '2',
    created_by: {
      name: 'Jane Smith',
      avatar: '',
    },
    subject: 'Request feature enhancement',
    ticket_code: 'TKT-002',
    attachment: 'document.pdf',
    assign_user: 'Support Team',
    status: 'On Hold',
    priority: 'Medium',
    created_at: '2024-01-14',
    has_unread_reply: false,
  },
  {
    id: '3',
    created_by: {
      name: 'Bob Johnson',
      avatar: '',
    },
    subject: 'Bug report in dashboard',
    ticket_code: 'TKT-003',
    attachment: '',
    assign_user: 'Dev Team',
    status: 'Close',
    priority: 'Critical',
    created_at: '2024-01-13',
    has_unread_reply: false,
  },
]

// Statistics
const totalTickets = 25
const openTickets = 8
const onHoldTickets = 5
const closeTickets = 12

const users = ['Admin User', 'Support Team', 'Dev Team']
const priorities = ['Low', 'Medium', 'High', 'Critical']
const statuses = ['Open', 'On Hold', 'Close']

export default function SupportPage() {
  const [supports, setSupports] = useState<Support[]>(mockSupports)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    user: '',
    priority: '',
    status: '',
    end_date: '',
    description: '',
    attachment: null as File | null,
  })

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setFormData({
        subject: '',
        user: '',
        priority: '',
        status: '',
        end_date: '',
        description: '',
        attachment: null,
      })
    }
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form data:', formData)
    handleDialogOpenChange(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this support ticket?')) return
    setSupports(supports.filter((s) => s.id !== id))
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-primary text-white'
      case 'Medium':
        return 'bg-blue-500 text-white'
      case 'High':
        return 'bg-yellow-500 text-white'
      case 'Critical':
        return 'bg-destructive text-white'
      default:
        return 'bg-primary text-white'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-green-500 text-white'
      case 'On Hold':
        return 'bg-yellow-500 text-white'
      case 'Close':
        return 'bg-destructive text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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
                <h1 className="text-2xl font-semibold">Support</h1>
                <p className="text-sm text-muted-foreground">
                  Manage support tickets and customer inquiries
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="shadow-none">
                  <LayoutGrid className="mr-2 h-4 w-4" /> Grid View
                </Button>
                <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="shadow-none">
                      <Plus className="mr-2 h-4 w-4" /> Create
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Support</DialogTitle>
                      <DialogDescription>
                        Create a new support ticket. Fill in the required information.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="subject">
                            Subject <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="subject"
                            value={formData.subject}
                            onChange={(e) =>
                              setFormData({ ...formData, subject: e.target.value })
                            }
                            placeholder="Enter Support"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="user">Support for User</Label>
                            <Select
                              value={formData.user}
                              onValueChange={(value) => setFormData({ ...formData, user: value })}
                            >
                              <SelectTrigger id="user">
                                <SelectValue placeholder="Select User" />
                              </SelectTrigger>
                              <SelectContent>
                                {users.map((user) => (
                                  <SelectItem key={user} value={user.toLowerCase().replace(' ', '_')}>
                                    {user}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              Create user here. <span className="font-medium text-primary cursor-pointer">Create user</span>
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Select
                              value={formData.priority}
                              onValueChange={(value) =>
                                setFormData({ ...formData, priority: value })
                              }
                            >
                              <SelectTrigger id="priority">
                                <SelectValue placeholder="Select Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                {priorities.map((priority) => (
                                  <SelectItem key={priority} value={priority.toLowerCase()}>
                                    {priority}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                              value={formData.status}
                              onValueChange={(value) =>
                                setFormData({ ...formData, status: value })
                              }
                            >
                              <SelectTrigger id="status">
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.map((status) => (
                                  <SelectItem key={status} value={status.toLowerCase().replace(' ', '_')}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="end_date">
                              End Date <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="end_date"
                              type="date"
                              value={formData.end_date}
                              onChange={(e) =>
                                setFormData({ ...formData, end_date: e.target.value })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({ ...formData, description: e.target.value })
                            }
                            placeholder="Enter Description"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="attachment">Attachment</Label>
                          <Input
                            id="attachment"
                            type="file"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                attachment: e.target.files?.[0] || null,
                              })
                            }
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Create</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Total Tickets */}
              <Card className="shadow-none border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TicketIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Total</p>
                        <h3 className="text-2xl font-semibold">Ticket</h3>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">{totalTickets}</h3>
                  </div>
                </CardContent>
              </Card>

              {/* Open Tickets */}
              <Card className="shadow-none border-l-4 border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-success/10">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Open</p>
                        <h3 className="text-2xl font-semibold">Ticket</h3>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">{openTickets}</h3>
                  </div>
                </CardContent>
              </Card>

              {/* On Hold Tickets */}
              <Card className="shadow-none border-l-4 border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-warning/10">
                        <PauseCircle className="h-5 w-5 text-warning" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">On Hold</p>
                        <h3 className="text-2xl font-semibold">Ticket</h3>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">{onHoldTickets}</h3>
                  </div>
                </CardContent>
              </Card>

              {/* Close Tickets */}
              <Card className="shadow-none border-l-4 border-l-destructive">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-destructive/10">
                        <XCircle className="h-5 w-5 text-destructive" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-1">Close</p>
                        <h3 className="text-2xl font-semibold">Ticket</h3>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">{closeTickets}</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Support Table */}
            <Card className="shadow-none">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Created By</TableHead>
                        <TableHead>Ticket</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Attachment</TableHead>
                        <TableHead>Assign User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supports.map((support) => (
                        <TableRow key={support.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <Avatar className="h-8 w-8 border-2 border-primary">
                                  <AvatarImage src={support.created_by.avatar} />
                                  <AvatarFallback>
                                    {getInitials(support.created_by.name)}
                                  </AvatarFallback>
                                </Avatar>
                                {support.has_unread_reply && (
                                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success border-2 border-background" />
                                )}
                              </div>
                              <span className="text-sm">{support.created_by.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <a
                                href="#"
                                className="font-semibold text-sm hover:underline mb-1 block"
                              >
                                {support.subject}
                              </a>
                              <Badge className={getPriorityColor(support.priority)}>
                                {support.priority}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {support.ticket_code}
                          </TableCell>
                          <TableCell>
                            {support.attachment ? (
                              <div className="flex items-center gap-2">
                                <Button variant="default" size="sm" className="shadow-none h-7">
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button variant="secondary" size="sm" className="shadow-none h-7">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>{support.assign_user || '-'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(support.status)}>
                              {support.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(support.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="default"
                                size="sm"
                                className="shadow-none bg-warning hover:bg-warning/90"
                              >
                                <Reply className="h-4 w-4" />
                              </Button>
                              <Button variant="default" size="sm" className="shadow-none bg-info">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="shadow-none"
                                onClick={() => handleDelete(support.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

