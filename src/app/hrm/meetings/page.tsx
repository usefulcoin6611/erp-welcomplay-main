'use client';

import { useState, useMemo } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { MainContentWrapper } from '@/components/main-content-wrapper';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Search, Calendar as CalendarIcon, List, X, Clock } from 'lucide-react';
import { EventCalendar } from '@/components/event-calendar';
import { getEmployeesList } from '@/lib/employee-data';

interface Meeting {
  id: string;
  title: string;
  branch: string;
  department: string;
  employeeId: string;
  date: string;
  time: string;
  note: string;
  status: string;
}

const BRANCHES = [
  { value: 'main', label: 'Main Branch' },
  { value: 'branch-office', label: 'Branch Office' },
  { value: 'remote', label: 'Remote Office' },
];

const DEPARTMENTS = [
  { value: 'it', label: 'IT Department' },
  { value: 'hr', label: 'HR Department' },
  { value: 'sales', label: 'Sales Department' },
  { value: 'finance', label: 'Finance Department' },
  { value: 'marketing', label: 'Marketing Department' },
];

const employeesList = getEmployeesList();

const defaultFormData = {
  branch: '',
  department: '',
  employeeId: '',
  title: '',
  date: '',
  time: '',
  note: '',
};

function getBranchLabel(value: string): string {
  return (BRANCHES.find((b) => b.value === value)?.label ?? value) || '-';
}
function getDepartmentLabel(value: string): string {
  return (DEPARTMENTS.find((d) => d.value === value)?.label ?? value) || '-';
}
function getEmployeeName(employeeId: string): string {
  return employeesList.find((e) => e.id.toString() === employeeId)?.name ?? '-';
}

const initialMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Weekly Team Standup',
    branch: 'main',
    department: 'it',
    employeeId: '1',
    date: '2024-03-20',
    time: '09:00',
    note: 'Daily sync',
    status: 'Scheduled',
  },
  {
    id: '2',
    title: 'Client Presentation',
    branch: 'main',
    department: 'sales',
    employeeId: '3',
    date: '2024-03-21',
    time: '14:00',
    note: '',
    status: 'Scheduled',
  },
  {
    id: '3',
    title: 'Project Review',
    branch: 'branch-office',
    department: 'it',
    employeeId: '2',
    date: '2024-03-18',
    time: '10:00',
    note: '',
    status: 'Completed',
  },
];

function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'Scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    case 'Rescheduled':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setFormData(defaultFormData);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ ...defaultFormData });
    setDialogOpen(true);
  };

  const handleEdit = (item: Meeting) => {
    setEditingId(item.id);
    setFormData({
      branch: item.branch,
      department: item.department,
      employeeId: item.employeeId,
      title: item.title,
      date: item.date,
      time: item.time,
      note: item.note ?? '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.branch ||
      !formData.department ||
      !formData.employeeId ||
      !formData.title.trim() ||
      !formData.date ||
      !formData.time
    ) {
      return;
    }

    if (editingId) {
      setMeetings((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                branch: formData.branch,
                department: formData.department,
                employeeId: formData.employeeId,
                title: formData.title,
                date: formData.date,
                time: formData.time,
                note: formData.note,
              }
            : item
        )
      );
    } else {
      const newItem: Meeting = {
        id: Date.now().toString(),
        title: formData.title,
        branch: formData.branch,
        department: formData.department,
        employeeId: formData.employeeId,
        date: formData.date,
        time: formData.time,
        note: formData.note,
        status: 'Scheduled',
      };
      setMeetings((prev) => [newItem, ...prev]);
    }
    handleDialogOpenChange(false);
  };

  const openDeleteConfirm = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (meetingToDelete) {
      setMeetings((prev) => prev.filter((item) => item.id !== meetingToDelete.id));
      setMeetingToDelete(null);
    }
    setDeleteAlertOpen(false);
  };

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return meetings;
    const q = searchTerm.trim().toLowerCase();
    return meetings.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        getBranchLabel(m.branch).toLowerCase().includes(q) ||
        getDepartmentLabel(m.department).toLowerCase().includes(q) ||
        getEmployeeName(m.employeeId).toLowerCase().includes(q)
    );
  }, [meetings, searchTerm]);

  const upcomingMeetings = useMemo(
    () =>
      meetings
        .filter(
          (m) =>
            m.status === 'Scheduled' &&
            new Date(`${m.date}T${m.time}`) >= new Date()
        )
        .sort(
          (a, b) =>
            new Date(`${a.date}T${a.time}`).getTime() -
            new Date(`${b.date}T${b.time}`).getTime()
        )
        .slice(0, 5),
    [meetings]
  );

  const calendarEvents = useMemo(
    () =>
      meetings.map((m) => ({
        id: m.id,
        title: m.title,
        date: m.date,
        time: m.time,
        type: 'meeting' as const,
      })),
    [meetings]
  );

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
          <MainContentWrapper>
            <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
              {/* Title Card */}
              <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                <CardHeader className="px-6 flex flex-row items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1 flex-1">
                    <CardTitle className="text-lg font-semibold">Meetings</CardTitle>
                    <CardDescription>
                      Kelola jadwal rapat internal dan eksternal. Lihat dalam bentuk daftar atau kalender.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* View toggle: List | Calendar */}
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
                        variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                        className={`h-7 w-7 shadow-none p-0 border-l border-muted ${
                          viewMode === 'calendar'
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'text-blue-600 hover:bg-blue-50'
                        }`}
                        onClick={() => setViewMode('calendar')}
                        title="Calendar view"
                      >
                        <CalendarIcon className="h-3 w-3" />
                      </Button>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
                      <Button
                        size="sm"
                        variant="blue"
                        className="shadow-none h-7"
                        onClick={handleAdd}
                      >
                        <Plus className="mr-2 h-3 w-3" />
                        Create Meeting
                      </Button>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingId ? 'Edit Meeting' : 'Create New Meeting'}
                          </DialogTitle>
                          <DialogDescription>
                            {editingId
                              ? 'Ubah informasi rapat.'
                              : 'Buat rapat baru. Isi field yang wajib.'}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="branch">
                                Branch <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={formData.branch}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, branch: value })
                                }
                                required
                              >
                                <SelectTrigger id="branch">
                                  <SelectValue placeholder="Select Branch" />
                                </SelectTrigger>
                                <SelectContent>
                                  {BRANCHES.map((b) => (
                                    <SelectItem key={b.value} value={b.value}>
                                      {b.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="department">
                                Department <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={formData.department}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, department: value })
                                }
                                required
                              >
                                <SelectTrigger id="department">
                                  <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DEPARTMENTS.map((d) => (
                                    <SelectItem key={d.value} value={d.value}>
                                      {d.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="employeeId">
                                Employee <span className="text-red-500">*</span>
                              </Label>
                              <Select
                                value={formData.employeeId}
                                onValueChange={(value) =>
                                  setFormData({ ...formData, employeeId: value })
                                }
                                required
                              >
                                <SelectTrigger id="employeeId">
                                  <SelectValue placeholder="Select Employee" />
                                </SelectTrigger>
                                <SelectContent>
                                  {employeesList.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id.toString()}>
                                      {emp.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="title">
                                Meeting Title <span className="text-red-500">*</span>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="date">
                                  Meeting Date <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                  <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                  <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) =>
                                      setFormData({ ...formData, date: e.target.value })
                                    }
                                    className="pr-9"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="time">
                                  Meeting Time <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                  <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                                  <Input
                                    id="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) =>
                                      setFormData({ ...formData, time: e.target.value })
                                    }
                                    className="pr-9"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="note">Meeting Note</Label>
                              <Textarea
                                id="note"
                                value={formData.note}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                  setFormData({ ...formData, note: e.target.value })
                                }
                                rows={3}
                                placeholder="Enter Meeting Note"
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
                              {editingId ? 'Update' : 'Create'}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
              </Card>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-lg border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 font-medium">Total Meetings</p>
                        <h3 className="text-3xl font-semibold text-gray-900">{meetings.length}</h3>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-sky-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-lg border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 font-medium">Scheduled</p>
                        <h3 className="text-3xl font-semibold text-gray-900">
                          {meetings.filter((m) => m.status === 'Scheduled').length}
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-lg border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 font-medium">Completed</p>
                        <h3 className="text-3xl font-semibold text-gray-900">
                          {meetings.filter((m) => m.status === 'Completed').length}
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-lg border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 font-medium">This Week</p>
                        <h3 className="text-3xl font-semibold text-gray-900">
                          {upcomingMeetings.length}
                        </h3>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Content: only one view at a time */}
              {viewMode === 'list' && (
                <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                  <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
                    <CardTitle>Meeting List</CardTitle>
                    <div className="flex w-full max-w-md items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search meetings..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="h-9 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:border-0 focus-visible:ring-0"
                        />
                        {searchTerm.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                            onClick={() => setSearchTerm('')}
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
                            <TableHead className="px-6">Title</TableHead>
                            <TableHead className="px-6">Branch</TableHead>
                            <TableHead className="px-6">Department</TableHead>
                            <TableHead className="px-6">Employee</TableHead>
                            <TableHead className="px-6">Meeting Date</TableHead>
                            <TableHead className="px-6">Meeting Time</TableHead>
                            <TableHead className="px-6">Status</TableHead>
                            <TableHead className="px-6 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredData.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="px-6 text-center py-8 text-muted-foreground"
                              >
                                No meetings found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredData.map((meeting) => (
                              <TableRow key={meeting.id}>
                                <TableCell className="px-6 font-medium">{meeting.title}</TableCell>
                                <TableCell className="px-6">{getBranchLabel(meeting.branch)}</TableCell>
                                <TableCell className="px-6">{getDepartmentLabel(meeting.department)}</TableCell>
                                <TableCell className="px-6">{getEmployeeName(meeting.employeeId)}</TableCell>
                                <TableCell className="px-6">{meeting.date}</TableCell>
                                <TableCell className="px-6">{meeting.time}</TableCell>
                                <TableCell className="px-6">
                                  <Badge className={getStatusBadgeColor(meeting.status)}>
                                    {meeting.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="px-6">
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200 shadow-none h-8"
                                      onClick={() => handleEdit(meeting)}
                                      title="Edit"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200 shadow-none h-8"
                                      onClick={() => openDeleteConfirm(meeting)}
                                      title="Delete"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {viewMode === 'calendar' && (
                <EventCalendar events={calendarEvents} />
              )}
            </div>
          </MainContentWrapper>
        </div>
      </SidebarInset>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              Meeting &quot;{meetingToDelete?.title}&quot; akan dihapus. Tindakan ini tidak dapat
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
