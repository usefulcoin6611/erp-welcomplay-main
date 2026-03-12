"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { MainContentWrapper } from '@/components/main-content-wrapper'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  FileSearch,
  CheckCircle2,
  XCircle,
  PauseCircle,
  Ticket as TicketIcon,
  Search,
  X,
  Upload,
  Trash2,
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
import { toast } from 'sonner'

// Types
interface Support {
  id: string
  created_by: {
    id?: string
    name: string
    avatar?: string
  }
  subject: string
  ticket_code: string
  description?: string
  attachment?: string
  assign_user?: string
  assign_user_id?: string
  status: 'Open' | 'On Hold' | 'Close'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  end_date?: string | null
  created_at: string
  has_unread_reply: boolean
}

const priorities = ['Low', 'Medium', 'High', 'Critical'] as const
const statuses = ['Open', 'On Hold', 'Close'] as const

type UserOption = { id: string; name: string }

export default function SupportPage() {
  const [supports, setSupports] = useState<Support[]>([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserOption[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dragActive, setDragActive] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    user: '',
    priority: 'Medium',
    status: 'Open',
    end_date: '',
    description: '',
    attachment: null as File | null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replySupport, setReplySupport] = useState<Support | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [replySubmitting, setReplySubmitting] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editSupport, setEditSupport] = useState<Support | null>(null)
  const [editFormData, setEditFormData] = useState({ subject: '', user: '', priority: 'Medium', status: 'Open', end_date: '', description: '', attachment: null as File | null })
  const [editDragActive, setEditDragActive] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewAttachment, setPreviewAttachment] = useState<string | null>(null)
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deleteSupportId, setDeleteSupportId] = useState<string | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewSupport, setViewSupport] = useState<Support | null>(null)
  const attachmentInputRef = useRef<HTMLInputElement>(null)
  const editAttachmentInputRef = useRef<HTMLInputElement>(null)

  const fetchSupports = useCallback(async () => {
    try {
      const res = await fetch('/api/support')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setSupports(json.data)
      } else {
        toast.error(json.message ?? 'Failed to load support tickets')
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to load support tickets')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users')
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setUsers(json.data.map((u: { id: string; name: string | null }) => ({ id: u.id, name: u.name || u.id })))
      }
    } catch (_e) {}
  }, [])

  useEffect(() => {
    fetchSupports()
    fetchUsers()
  }, [fetchSupports, fetchUsers])

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setFormData({
        subject: '',
        user: '',
        priority: 'Medium',
        status: 'Open',
        end_date: '',
        description: '',
        attachment: null,
      })
      attachmentInputRef.current && (attachmentInputRef.current.value = '')
    }
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('subject', formData.subject)
      if (formData.user) fd.append('user', formData.user)
      fd.append('priority', formData.priority)
      fd.append('status', formData.status)
      if (formData.end_date) fd.append('end_date', formData.end_date)
      if (formData.description) fd.append('description', formData.description)
      if (formData.attachment) fd.append('attachment', formData.attachment)
      const res = await fetch('/api/support', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.success && json.data) {
        setSupports((prev) => [json.data, ...prev])
        toast.success(json.message ?? 'Ticket created')
        handleDialogOpenChange(false)
      } else {
        toast.error(json.message ?? 'Failed to create ticket')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/support/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setSupports((prev) => prev.filter((s) => s.id !== id))
        setDeleteSupportId(null)
        setDeleteAlertOpen(false)
        toast.success(json.message ?? 'Ticket deleted')
      } else {
        toast.error(json.message ?? 'Failed to delete')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete ticket')
    }
  }

  const openDeleteConfirm = (id: string) => {
    setDeleteSupportId(id)
    setDeleteAlertOpen(true)
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replySupport) return
    setReplySubmitting(true)
    try {
      const res = await fetch(`/api/support/${replySupport.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message ?? 'Reply sent')
        setReplyMessage('')
        setReplySupport(null)
        setReplyDialogOpen(false)
        fetchSupports()
      } else {
        toast.error(json.message ?? 'Failed to send reply')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to send reply')
    } finally {
      setReplySubmitting(false)
    }
  }

  const openEditDialog = (support: Support) => {
    setEditSupport(support)
    setEditFormData({
      subject: support.subject,
      user: support.assign_user_id ?? '',
      priority: support.priority,
      status: support.status,
      end_date: support.end_date ?? '',
      description: support.description ?? '',
      attachment: null,
    })
    setEditDialogOpen(true)
    editAttachmentInputRef.current && (editAttachmentInputRef.current.value = '')
  }

  const openPreview = (attachment: string) => {
    setPreviewAttachment(attachment.startsWith('/') ? attachment : getAttachmentUrl(attachment))
    setPreviewOpen(true)
  }

  const closePreview = () => {
    setPreviewOpen(false)
    setPreviewAttachment(null)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editSupport) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('subject', editFormData.subject)
      if (editFormData.user) fd.append('user', editFormData.user)
      fd.append('priority', editFormData.priority)
      fd.append('status', editFormData.status)
      if (editFormData.end_date) fd.append('end_date', editFormData.end_date)
      if (editFormData.description) fd.append('description', editFormData.description)
      if (editFormData.attachment) fd.append('attachment', editFormData.attachment)
      const res = await fetch(`/api/support/${editSupport.id}`, { method: 'PUT', body: fd })
      const json = await res.json()
      if (json.success && json.data) {
        setSupports((prev) => prev.map((s) => (s.id === editSupport.id ? json.data : s)))
        toast.success(json.message ?? 'Ticket updated')
        setEditSupport(null)
        setEditDialogOpen(false)
        editAttachmentInputRef.current && (editAttachmentInputRef.current.value = '')
      } else {
        toast.error(json.message ?? 'Failed to update')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const openViewDialog = (support: Support) => {
    setViewSupport(support)
    setViewDialogOpen(true)
  }

  const handleStatusChange = async (supportId: string, newStatus: 'Open' | 'On Hold' | 'Close') => {
    try {
      const res = await fetch(`/api/support/${supportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const json = await res.json()
      if (json.success && json.data) {
        setSupports((prev) => prev.map((s) => (s.id === supportId ? json.data : s)))
        toast.success(json.message ?? 'Status updated')
      } else {
        toast.error(json.message ?? 'Failed to update status')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update status')
    }
  }

  const handleAttachmentDrop = (e: React.DragEvent, inputId: string) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) setFormData((prev) => ({ ...prev, attachment: file }))
  }
  const handleEditAttachmentDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setEditDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) setEditFormData((prev) => ({ ...prev, attachment: file }))
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

  const getAttachmentUrl = (attachment: string) =>
    attachment.startsWith('/') ? attachment : `/uploads/support/${attachment}`

  const isImageAttachment = (attachment: string) => {
    const lower = attachment.toLowerCase()
    return (
      lower.endsWith('.png') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.gif') ||
      lower.endsWith('.webp')
    )
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

  const totalTickets = supports.length
  const openTickets = supports.filter((s) => s.status === 'Open').length
  const onHoldTickets = supports.filter((s) => s.status === 'On Hold').length
  const closeTickets = supports.filter((s) => s.status === 'Close').length

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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
            {/* Title Page */}
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
              <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 space-y-1 flex-1">
                  <CardTitle className="text-lg font-semibold">Sistem Dukungan</CardTitle>
                  <CardDescription>
                    Kelola dan pantau tiket dukungan (support tickets) Anda. Lihat status tiket, prioritas, dan tanggapan dari setiap tiket yang sedang ditangani.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* View mode toggle (List / Grid) */}
                  <div className="inline-flex rounded-md bg-muted p-0.5">
                    <Button
                      type="button"
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
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
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
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
                  {/* Add Support */}
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
                                {users.map((u) => (
                                  <SelectItem key={u.id} value={u.id}>
                                    {u.name}
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
                                {priorities.map((p) => (
                                  <SelectItem key={p} value={p}>
                                    {p}
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
                                setFormData({ ...formData, status: value as typeof statuses[number] })
                              }
                            >
                              <SelectTrigger id="status">
                                <SelectValue placeholder="Select Status" />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.map((s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-3">
                            <Label htmlFor="end_date">End Date</Label>
                            <Input
                              id="end_date"
                              type="date"
                              value={formData.end_date}
                              onChange={(e) =>
                                setFormData({ ...formData, end_date: e.target.value })
                              }
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
                          <Label>Attachment</Label>
                          <div className="relative">
                            <label
                              htmlFor="attachment"
                              className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                                dragActive
                                  ? 'border-primary bg-primary/10'
                                  : 'border-muted-foreground/25 bg-muted/5 hover:bg-muted/10'
                              }`}
                              onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
                              onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => handleAttachmentDrop(e, 'attachment')}
                            >
                              {formData.attachment ? (
                                <div className="flex items-center gap-2 px-3 w-full">
                                  <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                                  <div className="flex flex-col items-start min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate max-w-[200px]">{formData.attachment.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {formData.attachment.size / 1024 < 1024
                                        ? `${(formData.attachment.size / 1024).toFixed(1)} KB`
                                        : `${(formData.attachment.size / (1024 * 1024)).toFixed(2)} MB`}
                                    </p>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 ml-2 text-muted-foreground hover:text-red-500 shrink-0"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setFormData((prev) => ({ ...prev, attachment: null }));
                                      attachmentInputRef.current && (attachmentInputRef.current.value = '');
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center py-2">
                                  <Upload className="w-4 h-4 mb-1 text-blue-500" />
                                  <p className="text-xs text-muted-foreground">PDF, DOC, JPG, PNG (MAX. 10MB)</p>
                                </div>
                              )}
                              <Input
                                id="attachment"
                                ref={attachmentInputRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    attachment: e.target.files?.[0] || null,
                                  }))
                                }
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setDialogOpen(false)}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="blue" className="shadow-none" disabled={submitting}>
                          {submitting ? 'Creating...' : 'Create'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
            </Card>

            {/* Statistics Cards - separated, no border */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-lg border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">Total Tickets</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{totalTickets}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                      <TicketIcon className="w-6 h-6 text-sky-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-lg border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">Open Tickets</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{openTickets}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-lg border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">On Hold Tickets</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{onHoldTickets}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                      <PauseCircle className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-lg border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600 font-medium">Close Tickets</p>
                      <h3 className="text-3xl font-semibold text-gray-900">{closeTickets}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Title and Search - shared */}
            {viewMode === 'list' ? (
            <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] rounded-lg border">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6 py-4 border-b">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <CardTitle className="text-base font-semibold">Support List</CardTitle>
                  <CardDescription className="text-sm">Search and manage tickets. Change status directly from the table.</CardDescription>
                </div>
                <div className="flex w-full max-w-md items-center gap-2 shrink-0">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                      placeholder="Search support tickets..."
                      value={search}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="h-9 border-0 bg-gray-50/80 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100/80 focus-visible:border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {search.length > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                        onClick={() => handleSearchChange('')}
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Created By</TableHead>
                        <TableHead className="px-6">Ticket</TableHead>
                        <TableHead className="px-6">Code</TableHead>
                        <TableHead className="px-6">Attachment</TableHead>
                        <TableHead className="px-6">Assign User</TableHead>
                        <TableHead className="px-6">Status</TableHead>
                        <TableHead className="px-6">Created At</TableHead>
                        <TableHead className="px-6">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="px-6 text-center py-8 text-muted-foreground">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : paginatedData.length > 0 ? (
                        paginatedData.map((support) => (
                        <TableRow key={support.id}>
                          <TableCell className="px-6">
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <Avatar className="h-9 w-9 border-2 border-white">
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
                          <TableCell className="px-6">
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
                          <TableCell className="px-6 font-mono text-sm font-normal">
                            {support.ticket_code}
                          </TableCell>
                          <TableCell className="px-6">
                            {support.attachment ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-blue-500 text-white hover:bg-blue-600 hover:text-white border-blue-500"
                                  title="Download"
                                >
                                  <a href={support.attachment?.startsWith('/') ? support.attachment : getAttachmentUrl(support.attachment)} download>
                                    <Download className="h-3 w-3" />
                                  </a>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 bg-amber-100 text-amber-800 hover:bg-amber-200 hover:text-amber-900 border-amber-200"
                                  title="Preview"
                                  onClick={() => openPreview(support.attachment!)}
                                >
                                  <FileSearch className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="px-6 font-normal">{support.assign_user || '-'}</TableCell>
                          <TableCell className="px-6">
                            <Select
                              value={support.status}
                              onValueChange={(value) => handleStatusChange(support.id, value as 'Open' | 'On Hold' | 'Close')}
                            >
                              <SelectTrigger
                                className={`h-8 min-w-[100px] border-0 shadow-none ${getStatusColor(support.status)} font-medium`}
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {status}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-6 font-normal">{formatDate(support.created_at)}</TableCell>
                          <TableCell className="px-6">
                            <div className="flex items-center gap-1.5">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:text-emerald-900 border-emerald-200"
                                onClick={() => openViewDialog(support)}
                                title="View"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
                                onClick={() => {
                                  setReplySupport(support)
                                  setReplyMessage('')
                                  setReplyDialogOpen(true)
                                }}
                                title="Reply"
                              >
                                <Reply className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                                onClick={() => openEditDialog(support)}
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="shadow-none h-7 bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                                onClick={() => openDeleteConfirm(support.id)}
                                title="Delete"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="px-6 text-center py-8 text-muted-foreground">
                            No support tickets found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {totalRecords > 0 && (
                  <div className="px-6 pb-6 pt-4">
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
                            <div className="border-b pb-3 mb-3">
                              <p className="text-xs text-muted-foreground mb-1.5">Status</p>
                              <Select
                                value={support.status}
                                onValueChange={(value) => handleStatusChange(support.id, value as 'Open' | 'On Hold' | 'Close')}
                              >
                                <SelectTrigger className={`h-8 text-xs border-0 shadow-none ${getStatusColor(support.status)} font-medium`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statuses.map((status) => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                                  className="shadow-none h-7 w-7 p-0 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:text-emerald-900 border-emerald-200"
                                  title="View"
                                  onClick={() => openViewDialog(support)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200"
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
                                  className="shadow-none h-7 w-7 p-0 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                                  title="Edit"
                                  onClick={() => openEditDialog(support)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-7 w-7 p-0 bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
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

            {/* View detail dialog */}
            <Dialog open={viewDialogOpen} onOpenChange={(open) => { setViewDialogOpen(open); if (!open) setViewSupport(null) }}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Ticket Details</DialogTitle>
                  <DialogDescription>
                    {viewSupport ? viewSupport.ticket_code : ''}
                  </DialogDescription>
                </DialogHeader>
                {viewSupport && (
                  <div className="space-y-4 py-2">
                    <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={viewSupport.created_by.avatar} />
                        <AvatarFallback>{getInitials(viewSupport.created_by.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{viewSupport.created_by.name}</p>
                        <p className="text-sm text-muted-foreground">{viewSupport.created_at}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Subject</p>
                      <p className="font-medium">{viewSupport.subject}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getStatusColor(viewSupport.status)}>{viewSupport.status}</Badge>
                      <Badge className={getPriorityColor(viewSupport.priority)}>{viewSupport.priority}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Assigned to</p>
                      <p className="text-sm">{viewSupport.assign_user || '-'}</p>
                    </div>
                    {viewSupport.attachment && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{viewSupport.attachment}</span>
                        <Button variant="outline" size="sm" className="h-7" asChild>
                          <a href={getAttachmentUrl(viewSupport.attachment)} download>
                            <Download className="h-3 w-3 mr-1" /> Download
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setViewDialogOpen(false)}>
                    Close
                  </Button>
                  <Button
                    type="button"
                    className="shadow-none bg-emerald-100 text-emerald-800 hover:bg-emerald-200 hover:text-emerald-900 border border-emerald-200"
                    onClick={() => viewSupport && (openEditDialog(viewSupport), setViewDialogOpen(false))}
                  >
                    Edit
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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
                      <Button type="submit" variant="blue" className="shadow-none" disabled={replySubmitting}>
                        {replySubmitting ? 'Sending...' : 'Send Reply'}
                      </Button>
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
                        <Input
                          value={editFormData.subject}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, subject: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Assign User</Label>
                          <Select
                            value={editFormData.user}
                            onValueChange={(v) => setEditFormData((prev) => ({ ...prev, user: v }))}
                          >
                            <SelectTrigger><SelectValue placeholder="Select User" /></SelectTrigger>
                            <SelectContent>
                              {users.map((u) => (
                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Select
                            value={editFormData.priority}
                            onValueChange={(v) => setEditFormData((prev) => ({ ...prev, priority: v }))}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {priorities.map((p) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={editFormData.status}
                            onValueChange={(v) => setEditFormData((prev) => ({ ...prev, status: v as typeof statuses[number] }))}
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {statuses.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={editFormData.end_date}
                            onChange={(e) => setEditFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          rows={3}
                          placeholder="Description"
                          value={editFormData.description}
                          onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Attachment (optional, replace existing)</Label>
                        <div className="relative">
                          <label
                            htmlFor="edit-attachment"
                            className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                              editDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 bg-muted/5 hover:bg-muted/10'
                            }`}
                            onDragEnter={(e) => { e.preventDefault(); setEditDragActive(true) }}
                            onDragLeave={(e) => { e.preventDefault(); setEditDragActive(false) }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleEditAttachmentDrop}
                          >
                            {editFormData.attachment ? (
                              <div className="flex items-center gap-2 px-3 w-full">
                                <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                                <div className="flex flex-col items-start min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate max-w-[200px]">{editFormData.attachment.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {editFormData.attachment.size / 1024 < 1024
                                      ? `${(editFormData.attachment.size / 1024).toFixed(1)} KB`
                                      : `${(editFormData.attachment.size / (1024 * 1024)).toFixed(2)} MB`}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 ml-2 text-muted-foreground hover:text-red-500 shrink-0"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setEditFormData((prev) => ({ ...prev, attachment: null }));
                                    editAttachmentInputRef.current && (editAttachmentInputRef.current.value = '');
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center py-2">
                                <Upload className="w-4 h-4 mb-1 text-blue-500" />
                                <p className="text-xs text-muted-foreground">PDF, DOC, JPG, PNG (MAX. 10MB)</p>
                                {editSupport.attachment && (
                                  <p className="text-xs text-muted-foreground mt-1">Current: {editSupport.attachment.split('/').pop()}</p>
                                )}
                              </div>
                            )}
                            <Input
                              id="edit-attachment"
                              ref={editAttachmentInputRef}
                              type="file"
                              className="hidden"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              onChange={(e) =>
                                setEditFormData((prev) => ({ ...prev, attachment: e.target.files?.[0] || null }))
                              }
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={submitting}>Cancel</Button>
                      <Button type="submit" variant="blue" className="shadow-none" disabled={submitting}>
                        {submitting ? 'Updating...' : 'Update'}
                      </Button>
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
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => deleteSupportId && handleDelete(deleteSupportId)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Attachment preview */}
            <Dialog open={previewOpen} onOpenChange={(open) => (open ? setPreviewOpen(true) : closePreview())}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Attachment Preview</DialogTitle>
                  <DialogDescription>
                    {previewAttachment ? previewAttachment : 'No attachment selected'}
                  </DialogDescription>
                </DialogHeader>
                {previewAttachment && (
                  <div className="space-y-4">
                    <div className="rounded-md border bg-muted/30 p-4">
                      {isImageAttachment(previewAttachment) ? (
                        <img
                          src={getAttachmentUrl(previewAttachment)}
                          alt={previewAttachment}
                          className="max-h-[420px] w-full rounded-md object-contain"
                        />
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm">
                            <p className="font-medium">File</p>
                            <p className="text-muted-foreground">{previewAttachment}</p>
                          </div>
                          <Button asChild variant="outline" size="sm" className="shadow-none">
                            <a href={getAttachmentUrl(previewAttachment)} download>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={closePreview}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </MainContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}

