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
  Trash,
  Calendar as CalendarIcon,
  ExternalLink,
  Video,
  Clock,
  List,
} from 'lucide-react'
import { EventCalendar } from '@/components/event-calendar'
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

// Types
interface ZoomMeeting {
  id: string
  title: string
  project?: string
  users: Array<{
    id: string
    name: string
    avatar?: string
  }>
  start_date: string
  duration: number
  join_url?: string
  start_url?: string
  status: 'waiting' | 'started' | 'end'
  created_by: string
  can_start: boolean
}

// Mock data
const mockMeetings: ZoomMeeting[] = [
  {
    id: '1',
    title: 'Weekly Team Sync',
    project: 'ERP Implementation',
    users: [
      { id: '1', name: 'John Doe', avatar: '' },
      { id: '2', name: 'Jane Smith', avatar: '' },
    ],
    start_date: '2024-01-20T10:00:00',
    duration: 60,
    join_url: 'https://zoom.us/j/123456789',
    start_url: 'https://zoom.us/s/123456789',
    status: 'waiting',
    created_by: '1',
    can_start: true,
  },
  {
    id: '2',
    title: 'Project Review Meeting',
    project: 'CRM Development',
    users: [
      { id: '3', name: 'Bob Johnson', avatar: '' },
      { id: '4', name: 'Alice Williams', avatar: '' },
    ],
    start_date: '2024-01-18T14:30:00',
    duration: 90,
    join_url: 'https://zoom.us/j/987654321',
    status: 'started',
    created_by: '2',
    can_start: false,
  },
  {
    id: '3',
    title: 'Client Presentation',
    project: 'Website Redesign',
    users: [{ id: '5', name: 'Charlie Brown', avatar: '' }],
    start_date: '2024-01-15T09:00:00',
    duration: 45,
    status: 'end',
    created_by: '3',
    can_start: false,
  },
]

const projects = ['ERP Implementation', 'CRM Development', 'Website Redesign', 'Mobile App']
const mockUsers = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Bob Johnson' },
  { id: '4', name: 'Alice Williams' },
]

export default function ZoomMeetingPage() {
  const [meetings, setMeetings] = useState<ZoomMeeting[]>(mockMeetings)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedProject, setSelectedProject] = useState<string>('')
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

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
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
    }
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form data:', formData)
    handleDialogOpenChange(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this meeting?')) return
    setMeetings(meetings.filter((m) => m.id !== id))
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
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Meeting</DialogTitle>
                      <DialogDescription>
                        Create a new Zoom meeting. Fill in the required information.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
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
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="project_id">Project</Label>
                            <Select
                              value={formData.project_id}
                              onValueChange={(value) => {
                                setFormData({ ...formData, project_id: value })
                                setSelectedProject(value)
                              }}
                            >
                              <SelectTrigger id="project_id">
                                <SelectValue placeholder="Select Project" />
                              </SelectTrigger>
                              <SelectContent>
                                {projects.map((project) => (
                                  <SelectItem
                                    key={project}
                                    value={project.toLowerCase().replace(' ', '_')}
                                  >
                                    {project}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              Create project here. <span className="font-medium text-primary cursor-pointer">Create project</span>
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="user_id">
                              Users <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={formData.user_id.join(',')}
                              onValueChange={(value) => {
                                const users = value ? value.split(',') : []
                                setFormData({ ...formData, user_id: users })
                              }}
                            >
                              <SelectTrigger id="user_id">
                                <SelectValue placeholder="Select User" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockUsers.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              Create user here. <span className="font-medium text-primary cursor-pointer">Create user</span>
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="start_date">
                              Start Date / Time <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="start_date"
                              type="datetime-local"
                              value={formData.start_date}
                              onChange={(e) =>
                                setFormData({ ...formData, start_date: e.target.value })
                              }
                              required
                            />
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
                        <div className="flex items-center justify-between">
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
                        <div className="flex items-center justify-between">
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
                        <Button type="submit" variant="blue" className="shadow-none bg-blue-500 hover:bg-blue-600 text-white">Create</Button>
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
                <CardContent className="px-5 pt-5 pb-5">
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
                        {meetings.map((meeting) => (
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
                              <Button
                                variant="outline"
                                size="sm"
                                className="shadow-none h-8 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200/60"
                                onClick={() => handleDelete(meeting.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

