"use client"

import { useMemo, useState, useEffect, useCallback } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import {
  Plus,
  Trash,
  Pencil,
  Calendar as CalendarIcon,
  ExternalLink,
  Video,
  Clock,
  List,
  Search,
} from 'lucide-react'
import { EventCalendar } from '@/components/event-calendar'
import { toast } from 'sonner'
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
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
interface ZoomMeeting {
  id: string
  title: string
  project?: string | null
  projectId?: string | null
  users: Array<{
    id: string
    name: string
    avatar?: string
  }>
  start_date: string
  duration: number
  join_url?: string
  start_url?: string
  status: 'waiting' | 'started' | 'ended'
  created_by: string
  can_start: boolean
}

type ProjectOption = { id: string; name: string }
type UserOption = { id: string; name: string; email?: string }

export default function ZoomMeetingPage() {
  const [meetings, setMeetings] = useState<ZoomMeeting[]>([])
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [search, setSearch] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState('')
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [deleteMeetingId, setDeleteMeetingId] = useState<string | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    project_id: '',
    user_id: [] as string[],
    start_date: '',
    duration: '',
    password: '',
    synchronize_type: false,
    client_id: true,
  })

  const fetchMeetings = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (selectedProject) params.set('projectId', selectedProject)
      const res = await fetch(`/api/zoom?${params}`)
      const json = await res.json()
      if (json.success && Array.isArray(json.data)) {
        setMeetings(json.data.map((m: any) => ({
          ...m,
          project: m.project?.name ?? m.project ?? null,
          status: m.status === 'end' ? 'ended' : m.status,
        })))
      }
    } catch {
      toast.error('Failed to load meetings')
    } finally {
      setLoading(false)
    }
  }, [selectedProject])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setProjects(json.data.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setUsers(json.data.map((u: { id: string; name?: string; email?: string }) => ({
            id: u.id,
            name: (u as any).name ?? (u as any).email ?? 'Unknown',
            email: (u as any).email,
          })))
        }
      })
      .catch(() => {})
  }, [])

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setEditingId(null)
      setFormData({
        title: '',
        project_id: '',
        user_id: [],
        start_date: '',
        duration: '',
        password: '',
        synchronize_type: false,
        client_id: true,
      })
      setSelectedProject('')
      setStartDate(undefined)
      setStartTime('')
    }
  }

  const openEdit = (meeting: ZoomMeeting) => {
    setEditingId(meeting.id)
    const start = new Date(meeting.start_date)
    setStartDate(start)
    setStartTime(start.toTimeString().slice(0, 5))
    setFormData({
      title: meeting.title,
      project_id: (meeting as any).projectDisplayId ?? (meeting as any).projectId ?? '',
      user_id: meeting.users.map((u) => u.id),
      start_date: meeting.start_date,
      duration: String(meeting.duration),
      password: '',
      synchronize_type: false,
      client_id: true,
    })
    setDialogOpen(true)
  }

  const toStartAtISO = () => {
    if (!formData.start_date) return ''
    if (formData.start_date.includes('T')) return new Date(formData.start_date).toISOString()
    const t = startTime || '00:00'
    return new Date(`${formData.start_date}T${t}:00`).toISOString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    // Creator is always a participant; additional participants optional
    const startAt = toStartAtISO()
    if (!startAt) {
      toast.error('Start date and time are required')
      return
    }
    const duration = Number(formData.duration)
    if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
      toast.error('Duration must be between 5 and 480 minutes')
      return
    }
    setSubmitLoading(true)
    try {
      if (editingId) {
        const res = await fetch(`/api/zoom/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title.trim(),
            projectId: formData.project_id || null,
            startAt,
            durationMinutes: duration,
            password: formData.password || null,
            syncGoogleCalendar: formData.synchronize_type,
            inviteClient: formData.client_id,
            participantUserIds: formData.user_id,
          }),
        })
        const json = await res.json()
        if (json.success) {
          toast.success('Meeting updated successfully')
          handleDialogOpenChange(false)
          fetchMeetings()
        } else {
          toast.error(json.message ?? 'Failed to update meeting')
        }
      } else {
        const res = await fetch('/api/zoom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title.trim(),
            projectId: formData.project_id || null,
            startAt,
            durationMinutes: duration,
            password: formData.password || null,
            syncGoogleCalendar: formData.synchronize_type,
            inviteClient: formData.client_id,
            participantUserIds: formData.user_id,
          }),
        })
        const json = await res.json()
        if (json.success) {
          toast.success('Meeting created successfully')
          handleDialogOpenChange(false)
          fetchMeetings()
        } else {
          toast.error(json.message ?? 'Failed to create meeting')
        }
      }
    } catch {
      toast.error('Request failed')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/zoom/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.success) {
        setMeetings((prev) => prev.filter((m) => m.id !== id))
        setDeleteMeetingId(null)
        setDeleteAlertOpen(false)
        toast.success('Meeting deleted')
      } else {
        toast.error(json.message ?? 'Failed to delete meeting')
      }
    } catch {
      toast.error('Request failed')
    }
  }

  const openDeleteConfirm = (id: string) => {
    setDeleteMeetingId(id)
    setDeleteAlertOpen(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const buildStartDateValue = (date?: Date, time?: string) => {
    if (!date) return ''
    const dateValue = formatDateInput(date)
    if (time) return `${dateValue}T${time}`
    return dateValue
  }

  const checkDateTime = (startDate: string) => {
    return new Date(startDate) > new Date()
  }

  const getStatusBadge = (meeting: ZoomMeeting) => {
    const isActive = checkDateTime(meeting.start_date)
    
    if (!isActive) {
      return <Badge className="bg-gray-100 text-gray-700">End</Badge>
    }
    
    if (meeting.status === 'waiting') {
      return <Badge className="bg-yellow-100 text-yellow-700">Waiting</Badge>
    }
    
    return <Badge className="bg-green-100 text-green-700">Started</Badge>
  }

  const filteredMeetings = useMemo(() => {
    if (!search.trim()) return meetings
    const q = search.trim().toLowerCase()
    return meetings.filter((meeting) =>
      meeting.title.toLowerCase().includes(q) ||
      (meeting.project ?? '').toLowerCase().includes(q) ||
      meeting.users.some((user) => user.name.toLowerCase().includes(q)),
    )
  }, [meetings, search])

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
        <div className="flex flex-1 flex-col bg-gray-100">
          <div className="@container/main flex flex-1 flex-col gap-4 p-4">
            {/* Header */}
            <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
              <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">Manage Zoom Meeting</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Create and manage Zoom meetings
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className={`shadow-none ${viewMode === 'list' ? 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white border-blue-500' : 'bg-gray-100 text-foreground hover:bg-blue-50 hover:text-blue-700 border-0'}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="mr-2 h-4 w-4" /> List View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`shadow-none ${viewMode === 'calendar' ? 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white border-blue-500' : 'bg-gray-100 text-foreground hover:bg-blue-50 hover:text-blue-700 border-0'}`}
                  onClick={() => setViewMode('calendar')}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" /> Calendar View
                </Button>
                <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="blue" className="shadow-none bg-blue-500 hover:bg-blue-600 text-white">
                      <Plus className="mr-2 h-4 w-4" /> Create
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl w-[90vw] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingId ? 'Edit Meeting' : 'Create New Meeting'}</DialogTitle>
                      <DialogDescription>
                        {editingId ? 'Update the Zoom meeting details.' : 'Create a new Zoom meeting. Fill in the required information.'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-6 py-6">
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="title">
                            Title <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="Enter Meeting Title"
                            required
                          />
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="project_id">Project</Label>
                            <Select
                              value={formData.project_id || '__none__'}
                              onValueChange={(value) => {
                                const v = value === '__none__' ? '' : value
                                setFormData({ ...formData, project_id: v })
                                setSelectedProject(v)
                              }}
                            >
                              <SelectTrigger id="project_id" className="bg-white text-foreground border border-input">
                                <SelectValue placeholder="Select Project" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">None</SelectItem>
                                {projects.map((project) => (
                                  <SelectItem key={project.id} value={project.id}>
                                    {project.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              Optional. Link meeting to a project.
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="user_id">
                              Users <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={formData.user_id[0] ?? '__placeholder__'}
                              onValueChange={(value) => {
                                if (value === '__placeholder__') {
                                  setFormData({ ...formData, user_id: [] })
                                } else {
                                  setFormData({ ...formData, user_id: [value] })
                                }
                              }}
                            >
                              <SelectTrigger id="user_id" className="bg-white text-foreground border border-input">
                                <SelectValue placeholder="Select User" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__placeholder__">Select user</SelectItem>
                                {users.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              At least one participant required.
                            </p>
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="start_date">
                              Start Date / Time <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                      'w-full justify-start text-left font-normal shadow-none',
                                      !startDate && 'text-muted-foreground',
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? (
                                      startDate.toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                      })
                                    ) : (
                                      <span>Pilih tanggal</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => {
                                      setStartDate(date)
                                      setFormData((prev) => ({
                                        ...prev,
                                        start_date: buildStartDateValue(date, startTime),
                                      }))
                                    }}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <Input
                                id="start_time"
                                type="time"
                                value={startTime}
                                onChange={(e) => {
                                  const value = e.target.value
                                  setStartTime(value)
                                  setFormData((prev) => ({
                                    ...prev,
                                    start_date: buildStartDateValue(startDate, value),
                                  }))
                                }}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">
                              Duration (Minutes) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="duration"
                              type="number"
                              value={formData.duration}
                              onChange={(e) =>
                                setFormData({ ...formData, duration: e.target.value })
                              }
                              placeholder="Enter Duration in minutes"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password (Optional)</Label>
                            <Input
                              id="password"
                              type="password"
                              value={formData.password}
                              onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                              }
                              placeholder="Enter Password"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:col-span-2">
                          <Label htmlFor="synchronize_type">
                            Synchronize in Google Calendar?
                          </Label>
                          <Switch
                            id="synchronize_type"
                            checked={formData.synchronize_type}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, synchronize_type: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between sm:col-span-2">
                          <Label htmlFor="client_id">Invite Client For Zoom Meeting</Label>
                          <Switch
                            id="client_id"
                            checked={formData.client_id}
                            onCheckedChange={(checked) =>
                              setFormData({ ...formData, client_id: checked })
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
                        <Button type="submit" variant="blue" className="shadow-none bg-blue-500 hover:bg-blue-600 text-white" disabled={submitLoading}>
                          {submitLoading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* List View */}
            {viewMode === 'list' && (
              <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
                  <CardTitle>Zoom Meeting List</CardTitle>
                  <div className="flex w-full max-w-md items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Input
                        placeholder="Search meetings..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-9 bg-gray-50 pl-9 pr-3 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0 border-0"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pt-0 pb-5">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Meeting Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Join URL</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-end">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell colSpan={8} className="h-12 animate-pulse bg-muted/50" />
                            </TableRow>
                          ))
                        ) : filteredMeetings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                              No meetings found.
                            </TableCell>
                          </TableRow>
                        ) : filteredMeetings.map((meeting) => (
                          <TableRow key={meeting.id}>
                            <TableCell className="font-medium">{meeting.title}</TableCell>
                            <TableCell>{meeting.project || '-'}</TableCell>
                            <TableCell>
                              {meeting.users.length > 0 ? (
                                <div className="flex -space-x-2">
                                  {meeting.users.slice(0, 3).map((user) => (
                                    <Avatar
                                      key={user.id}
                                      className="h-8 w-8 border-2 border-background"
                                    >
                                      <AvatarImage src={user.avatar} />
                                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                  ))}
                                  {meeting.users.length > 3 && (
                                    <Avatar className="h-8 w-8 border-2 border-background bg-muted">
                                      <AvatarFallback className="text-xs">
                                        +{meeting.users.length - 3}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>{formatDateTime(meeting.start_date)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {meeting.duration} Minutes
                              </div>
                            </TableCell>
                            <TableCell>
                              {checkDateTime(meeting.start_date) ? (
                                meeting.can_start && meeting.start_url ? (
                                  <a
                                    href={meeting.start_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                  >
                                    Start meeting <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : meeting.join_url ? (
                                  <a
                                    href={meeting.join_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                  >
                                    Join meeting <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : (
                                  '-'
                                )
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(meeting)}</TableCell>
                            <TableCell className="text-end">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-8"
                                  onClick={() => openEdit(meeting)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="shadow-none h-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200/60"
                                  onClick={() => openDeleteConfirm(meeting.id)}
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
            )}

            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Calendar */}
                <div className="lg:col-span-2">
                  <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
                    <CardContent className="p-4">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold">Calendar</h3>
                      </div>
                      <EventCalendar
                        events={meetings.map((meeting) => ({
                          id: meeting.id,
                          title: meeting.title,
                          date: meeting.start_date.split('T')[0],
                          time: new Date(meeting.start_date).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          }),
                          type: 'meeting' as const,
                        }))}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Meetings List */}
                <div className="lg:col-span-1">
                  <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white">
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-4">Meetings</h3>
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {meetings
                          .filter((meeting) => {
                            const meetingDate = new Date(meeting.start_date)
                            const currentMonth = new Date().getMonth()
                            return meetingDate.getMonth() === currentMonth
                          })
                          .map((meeting) => (
                            <div
                              key={meeting.id}
                              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-shrink-0 mt-1">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Video className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-sm mb-1 line-clamp-1">
                                  {meeting.title}
                                </h5>
                                <p className="text-xs text-muted-foreground">
                                  {formatDateTime(meeting.start_date)}
                                </p>
                              </div>
                            </div>
                          ))}
                        {meetings.filter((meeting) => {
                          const meetingDate = new Date(meeting.start_date)
                          const currentMonth = new Date().getMonth()
                          return meetingDate.getMonth() === currentMonth
                        }).length === 0 && (
                          <div className="text-center text-sm text-muted-foreground py-8">
                            No meetings this month
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            <AlertDialog
              open={deleteAlertOpen}
              onOpenChange={(open) => {
                setDeleteAlertOpen(open)
                if (!open) setDeleteMeetingId(null)
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete meeting?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Do you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={() => deleteMeetingId && handleDelete(deleteMeetingId)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

