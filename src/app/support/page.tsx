"use client"

import { useState, useMemo } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
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
  List,
  Download,
  Eye,
  Reply,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  PauseCircle,
  Ticket as TicketIcon,
  Search,
  X,
} from 'lucide-react'
import { SimplePagination } from '@/components/ui/simple-pagination'
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
  {
    id: '4',
    created_by: {
      name: 'Alice Williams',
      avatar: '',
    },
    subject: 'Password reset not working',
    ticket_code: 'TKT-004',
    attachment: '',
    assign_user: 'Admin User',
    status: 'Open',
    priority: 'High',
    created_at: '2024-01-12',
    has_unread_reply: true,
  },
  {
    id: '5',
    created_by: {
      name: 'Charlie Brown',
      avatar: '',
    },
    subject: 'Invoice generation error',
    ticket_code: 'TKT-005',
    attachment: 'error_log.txt',
    assign_user: 'Dev Team',
    status: 'On Hold',
    priority: 'Medium',
    created_at: '2024-01-11',
    has_unread_reply: false,
  },
  {
    id: '6',
    created_by: {
      name: 'Diana Prince',
      avatar: '',
    },
    subject: 'Report export failing',
    ticket_code: 'TKT-006',
    attachment: '',
    assign_user: 'Support Team',
    status: 'Open',
    priority: 'Low',
    created_at: '2024-01-10',
    has_unread_reply: false,
  },
  {
    id: '7',
    created_by: {
      name: 'Edward Norton',
      avatar: '',
    },
    subject: 'User permission issue',
    ticket_code: 'TKT-007',
    attachment: 'screenshot.png',
    assign_user: 'Admin User',
    status: 'Close',
    priority: 'Critical',
    created_at: '2024-01-09',
    has_unread_reply: false,
  },
  {
    id: '8',
    created_by: {
      name: 'Fiona Apple',
      avatar: '',
    },
    subject: 'Email notification not sent',
    ticket_code: 'TKT-008',
    attachment: '',
    assign_user: 'Dev Team',
    status: 'Open',
    priority: 'Medium',
    created_at: '2024-01-08',
    has_unread_reply: true,
  },
  {
    id: '9',
    created_by: {
      name: 'George Clooney',
      avatar: '',
    },
    subject: 'Data synchronization problem',
    ticket_code: 'TKT-009',
    attachment: '',
    assign_user: 'Support Team',
    status: 'On Hold',
    priority: 'High',
    created_at: '2024-01-07',
    has_unread_reply: false,
  },
  {
    id: '10',
    created_by: {
      name: 'Helen Mirren',
      avatar: '',
    },
    subject: 'Mobile app crash on iOS',
    ticket_code: 'TKT-010',
    attachment: 'crash_report.log',
    assign_user: 'Dev Team',
    status: 'Open',
    priority: 'Critical',
    created_at: '2024-01-06',
    has_unread_reply: true,
  },
  {
    id: '11',
    created_by: {
      name: 'Ian McKellen',
      avatar: '',
    },
    subject: 'Slow page loading',
    ticket_code: 'TKT-011',
    attachment: '',
    assign_user: 'Admin User',
    status: 'Close',
    priority: 'Low',
    created_at: '2024-01-05',
    has_unread_reply: false,
  },
  {
    id: '12',
    created_by: {
      name: 'Julia Roberts',
      avatar: '',
    },
    subject: 'Payment gateway integration issue',
    ticket_code: 'TKT-012',
    attachment: 'api_response.json',
    assign_user: 'Dev Team',
    status: 'On Hold',
    priority: 'High',
    created_at: '2024-01-04',
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [formData, setFormData] = useState({
    subject: '',
    user: '',
    priority: '',
    status: '',
    end_date: '',
    description: '',
    attachment: null as File | null,
  })
  // Reply dialog
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replySupport, setReplySupport] = useState<Support | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  // Edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editSupport, setEditSupport] = useState<Support | null>(null)
  // Delete confirmation
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deleteSupportId, setDeleteSupportId] = useState<string | null>(null)

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
    setSupports(supports.filter((s) => s.id !== id))
    setDeleteSupportId(null)
    setDeleteAlertOpen(false)
  }

  const openDeleteConfirm = (id: string) => {
    setDeleteSupportId(id)
    setDeleteAlertOpen(true)
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle reply submit – e.g. API call
    setReplyMessage('')
    setReplySupport(null)
    setReplyDialogOpen(false)
  }

  const openEditDialog = (support: Support) => {
    setEditSupport(support)
    setEditDialogOpen(true)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editSupport) return
    // Handle edit submit – e.g. API call; here we only close
    setEditSupport(null)
    setEditDialogOpen(false)
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
        return 'bg-blue-100 text-blue-700'
      case 'Medium':
        return 'bg-purple-100 text-purple-700'
      case 'High':
        return 'bg-yellow-100 text-yellow-700'
      case 'Critical':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-700'
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-700'
      case 'Close':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
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

  // Filtered data
  const filteredData = useMemo(() => {
    if (!search.trim()) return supports
    
    const q = search.trim().toLowerCase()
    return supports.filter(
      (support) =>
        support.subject.toLowerCase().includes(q) ||
        support.ticket_code.toLowerCase().includes(q) ||
        support.created_by.name.toLowerCase().includes(q) ||
        (support.assign_user && support.assign_user.toLowerCase().includes(q))
    )
  }, [search, supports])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const totalRecords = filteredData.length

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
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
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-md bg-muted p-0.5">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={`h-7 w-7 shadow-none p-0 ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setViewMode('list')}
                    title="List view"
                  >
                    <List className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className={`h-7 w-7 shadow-none p-0 border-l border-muted ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <LayoutGrid className="h-3 w-3" />
                  </Button>
                </div>
                <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="blue" className="shadow-none h-7">
                      <Plus className="mr-2 h-3 w-3" /> Add Support
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
                        <Button type="submit" variant="blue" className="shadow-none">Create</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Total Tickets */}
              <Card className="rounded-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">Total Tickets</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{totalTickets}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <TicketIcon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Open Tickets */}
              <Card className="rounded-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">Open Tickets</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{openTickets}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* On Hold Tickets */}
              <Card className="rounded-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">On Hold Tickets</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{onHoldTickets}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                      <PauseCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Close Tickets */}
              <Card className="rounded-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">Close Tickets</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{closeTickets}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Title and Search - shared */}
            {viewMode === 'list' ? (
            <Card>
              <CardContent className="p-0">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Support List</CardTitle>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search support tickets..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
                    />
                    {search.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => handleSearchChange('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-4 py-3 font-normal">Created By</TableHead>
                        <TableHead className="px-4 py-3 font-normal">Ticket</TableHead>
                        <TableHead className="px-4 py-3 font-normal">Code</TableHead>
                        <TableHead className="px-4 py-3 font-normal">Attachment</TableHead>
                        <TableHead className="px-4 py-3 font-normal">Assign User</TableHead>
                        <TableHead className="px-4 py-3 font-normal">Status</TableHead>
                        <TableHead className="px-4 py-3 font-normal">Created At</TableHead>
                        <TableHead className="px-4 py-3 font-normal">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.length > 0 ? (
                        paginatedData.map((support) => (
                        <TableRow key={support.id}>
                          <TableCell className="px-4 py-3">
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
                              <span className="text-sm font-normal">{support.created_by.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <a
                                href="#"
                                className="font-normal text-sm hover:underline mb-1 block"
                              >
                                {support.subject}
                              </a>
                              <Badge className={getPriorityColor(support.priority)}>
                                {support.priority}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm font-normal">
                            {support.ticket_code}
                          </TableCell>
                          <TableCell>
                            {support.attachment ? (
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="sm" className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="font-normal">{support.assign_user || '-'}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(support.status)}>
                              {support.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-normal">{formatDate(support.created_at)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                                onClick={() => {
                                  setReplySupport(support)
                                  setReplyMessage('')
                                  setReplyDialogOpen(true)
                                }}
                              >
                                <Reply className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                onClick={() => openEditDialog(support)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                onClick={() => openDeleteConfirm(support.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                            No support tickets found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {totalRecords > 0 && (
                  <div className="px-4 py-3 border-t">
                    <SimplePagination
                      totalCount={totalRecords}
                      currentPage={currentPage}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(size) => {
                        setPageSize(size)
                        setCurrentPage(1)
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            ) : (
                /* Grid view - card terpisah per ticket */
                <>
                  <div className="rounded-lg border bg-card px-4 py-3 flex items-center justify-between mb-4">
                    <CardTitle className="text-base font-medium mb-0">Support List</CardTitle>
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search support tickets..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 pr-9 h-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
                      />
                      {search.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => handleSearchChange('')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((support) => (
                        <Card key={support.id} className="flex flex-col">
                          <CardContent className="p-4 flex flex-col flex-1">
                            <div className="flex flex-1 items-start gap-3 border-b pb-3 mb-3">
                              <div className="relative shrink-0">
                                <Avatar className="h-10 w-10 border-2 border-primary">
                                  <AvatarImage src={support.created_by.avatar} />
                                  <AvatarFallback>{getInitials(support.created_by.name)}</AvatarFallback>
                                </Avatar>
                                {support.has_unread_reply && (
                                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate">{support.created_by.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{support.subject}</p>
                              </div>
                              {support.attachment && (
                                <Button variant="outline" size="sm" className="shrink-0 h-7" title="Download">
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2 border-b pb-3 mb-3 text-sm">
                              <span className="text-muted-foreground">Code:</span>
                              <span className="font-mono font-medium">{support.ticket_code}</span>
                              <span className="text-muted-foreground">Priority:</span>
                              <Badge className={getPriorityColor(support.priority)}>{support.priority}</Badge>
                            </div>
                            <div className="flex items-center justify-between gap-2 mt-auto">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {formatDate(support.created_at)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-yellow-100"
                                  title="Reply"
                                  onClick={() => {
                                    setReplySupport(support)
                                    setReplyMessage('')
                                    setReplyDialogOpen(true)
                                  }}
                                >
                                  <Reply className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                                  title="Edit"
                                  onClick={() => openEditDialog(support)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                                  title="Delete"
                                  onClick={() => openDeleteConfirm(support.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center text-muted-foreground rounded-lg border border-dashed">
                        No support tickets found
                      </div>
                    )}
                  </div>
                  {totalRecords > 0 && (
                    <div className="mt-4">
                      <SimplePagination
                        totalCount={totalRecords}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                          setPageSize(size)
                          setCurrentPage(1)
                        }}
                      />
                    </div>
                  )}
                </>
            )}

            {/* Reply dialog */}
            <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Support Reply</DialogTitle>
                  <DialogDescription>
                    {replySupport ? `Reply to ticket ${replySupport.ticket_code}` : ''}
                  </DialogDescription>
                </DialogHeader>
                {replySupport && (
                  <form onSubmit={handleReplySubmit}>
                    <div className="space-y-4 py-4">
                      <div className="rounded-lg border p-3 bg-muted/30">
                        <p className="text-sm font-medium">{replySupport.subject}</p>
                        <p className="text-xs text-muted-foreground mt-1">{replySupport.created_by.name} · {replySupport.ticket_code}</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reply-message">Your reply</Label>
                        <Textarea
                          id="reply-message"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your reply..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setReplyDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="blue" className="shadow-none">Send Reply</Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit dialog */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditSupport(null) }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Support</DialogTitle>
                  <DialogDescription>
                    {editSupport ? `Edit ticket ${editSupport.ticket_code}` : ''}
                  </DialogDescription>
                </DialogHeader>
                {editSupport && (
                  <form onSubmit={handleEditSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <Input defaultValue={editSupport.subject} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select defaultValue={editSupport.priority.toLowerCase()}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {priorities.map((p) => (
                                <SelectItem key={p} value={p.toLowerCase()}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select defaultValue={editSupport.status.toLowerCase().replace(' ', '_')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {statuses.map((s) => (
                                <SelectItem key={s} value={s.toLowerCase().replace(' ', '_')}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea rows={3} placeholder="Description" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" variant="blue" className="shadow-none">Update</Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            {/* Delete confirmation */}
            <AlertDialog open={deleteAlertOpen} onOpenChange={(open) => { setDeleteAlertOpen(open); if (!open) setDeleteSupportId(null) }}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete support ticket?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Do you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => deleteSupportId && handleDelete(deleteSupportId)}
                  >
                    Delete
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

