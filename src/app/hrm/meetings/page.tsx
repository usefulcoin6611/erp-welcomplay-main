'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
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
import { Plus, Pencil, Trash2, Search, Calendar as CalendarIcon, List, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { EventCalendar } from '@/components/event-calendar';
import { toast } from 'sonner';

interface Meeting {
  id: string;
  title: string;
  branch: string;
  department: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  time: string;
  note: string;
  status: string;
}

interface BranchOption {
  id: string;
  name: string;
}

interface DepartmentOption {
  id: string;
  name: string;
}

interface EmployeeOption {
  id: string;
  name: string;
}

const defaultFormData = {
  branch: '',
  department: '',
  employeeId: '',
  title: '',
  date: '',
  time: '',
  note: '',
};

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
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<Meeting | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [meetingsRes, branchesRes, deptsRes, employeesRes] = await Promise.all([
        fetch('/api/hrm/meetings'),
        fetch('/api/branches'),
        fetch('/api/departments'),
        fetch('/api/hrm/admin/employees'),
      ]);

      const [meetingsJson, branchesJson, deptsJson, employeesJson] = await Promise.all([
        meetingsRes.json().catch(() => null),
        branchesRes.json().catch(() => null),
        deptsRes.json().catch(() => null),
        employeesRes.json().catch(() => null),
      ]);

      if (!meetingsRes.ok || !meetingsJson?.success) {
        toast.error(meetingsJson?.message ?? 'Failed to load meetings');
      } else if (Array.isArray(meetingsJson.data)) {
        setMeetings(meetingsJson.data);
      }

      if (branchesRes.ok && branchesJson?.success && Array.isArray(branchesJson.data)) {
        setBranches(branchesJson.data.map((b: { id: string; name: string }) => ({ id: b.id, name: b.name })));
      } else if (!branchesRes.ok) {
        toast.error(branchesJson?.message ?? 'Failed to load branches');
      }
      if (deptsRes.ok && deptsJson?.success && Array.isArray(deptsJson.data)) {
        setDepartments(
          deptsJson.data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name }))
        );
      } else if (!deptsRes.ok) {
        toast.error(deptsJson?.message ?? 'Failed to load departments');
      }
      if (employeesRes.ok && employeesJson?.success && Array.isArray(employeesJson.data)) {
        setEmployees(employeesJson.data);
      } else if (!employeesRes.ok) {
        toast.error(employeesJson?.message ?? 'Failed to load employees');
      }
    } catch (error) {
      console.error('Error loading meetings data', error);
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const getBranchLabel = (value: string) =>
    (branches.find((b) => b.name === value)?.name ?? value) || '-';
  const getDepartmentLabel = (value: string) =>
    (departments.find((d) => d.name === value)?.name ?? value) || '-';
  const getEmployeeName = (employeeId: string) =>
    employees.find((e) => e.id === employeeId)?.name ?? '-';

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
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    const url = editingId ? `/api/hrm/meetings/${editingId}` : '/api/hrm/meetings';
    const method = editingId ? 'PUT' : 'POST';
    const body = {
      title: formData.title.trim(),
      branch: formData.branch.trim(),
      department: formData.department.trim(),
      employeeId: formData.employeeId,
      meetingDate: formData.date,
      meetingTime: formData.time,
      note: formData.note?.trim() || undefined,
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          toast.error(json?.message ?? 'Failed to save meeting');
          return;
        }
        toast.success(editingId ? 'Meeting updated' : 'Meeting created');
        handleDialogOpenChange(false);
        fetchInitialData();
      })
      .catch((err) => {
        console.error('Error saving meeting', err);
        toast.error('Failed to save meeting');
      })
      .finally(() => setSaving(false));
  };

  const openDeleteConfirm = (meeting: Meeting) => {
    setMeetingToDelete(meeting);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!meetingToDelete) {
      setDeleteAlertOpen(false);
      return;
    }
    setSaving(true);
    fetch(`/api/hrm/meetings/${meetingToDelete.id}`, { method: 'DELETE' })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          toast.error(json?.message ?? 'Failed to delete meeting');
          return;
        }
        toast.success('Meeting deleted');
        setMeetingToDelete(null);
        fetchInitialData();
      })
      .catch((err) => {
        console.error('Error deleting meeting', err);
        toast.error('Failed to delete meeting');
      })
      .finally(() => {
        setSaving(false);
        setDeleteAlertOpen(false);
      });
  };

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return meetings;
    const q = searchTerm.trim().toLowerCase();
    return meetings.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        getBranchLabel(m.branch).toLowerCase().includes(q) ||
        getDepartmentLabel(m.department).toLowerCase().includes(q) ||
        (m.employeeName ?? getEmployeeName(m.employeeId)).toLowerCase().includes(q)
    );
  }, [meetings, searchTerm, branches, departments, employees]);

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

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
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-6 gap-0">
                        <DialogHeader className="pb-6 text-left">
                          <DialogTitle className="text-xl font-semibold tracking-tight">
                            {editingId ? 'Edit Meeting' : 'Create Meeting'}
                          </DialogTitle>
                          <DialogDescription className="mt-1.5 text-muted-foreground">
                            {editingId
                              ? 'Update meeting details below.'
                              : 'Fill in the required fields to create a new meeting.'}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                          <div className="flex flex-col gap-6">
                            {/* 1st line: Meeting Title */}
                            <div className="space-y-1.5">
                              <Label htmlFor="title" className="text-sm font-medium text-foreground">
                                Meeting Title <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                  setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="e.g. Weekly Team Standup"
                                required
                                className="h-10 rounded-lg"
                              />
                            </div>

                            {/* 2nd line: Branch & Department */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                              <div className="space-y-1.5">
                                <Label htmlFor="branch" className="text-sm font-medium text-foreground">
                                  Branch <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                  value={formData.branch}
                                  onValueChange={(value) =>
                                    setFormData({ ...formData, branch: value })
                                  }
                                  required
                                >
                                  <SelectTrigger id="branch" className="h-10 rounded-lg">
                                    <SelectValue placeholder="Select branch" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {branches.map((b) => (
                                      <SelectItem key={b.id} value={b.name}>
                                        {b.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="department" className="text-sm font-medium text-foreground">
                                  Department <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                  value={formData.department}
                                  onValueChange={(value) =>
                                    setFormData({ ...formData, department: value })
                                  }
                                  required
                                >
                                  <SelectTrigger id="department" className="h-10 rounded-lg">
                                    <SelectValue placeholder="Select department" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {departments.map((d) => (
                                      <SelectItem key={d.id} value={d.name}>
                                        {d.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* 3rd line: Employee & Meeting Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                              <div className="space-y-1.5">
                                <Label htmlFor="employeeId" className="text-sm font-medium text-foreground">
                                  Employee <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                  value={formData.employeeId}
                                  onValueChange={(value) =>
                                    setFormData({ ...formData, employeeId: value })
                                  }
                                  required
                                >
                                  <SelectTrigger id="employeeId" className="h-10 rounded-lg">
                                    <SelectValue placeholder="Select employee" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {employees.map((emp) => (
                                      <SelectItem key={emp.id} value={emp.id}>
                                        {emp.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1.5">
                                <Label htmlFor="date" className="text-sm font-medium text-foreground">
                                  Meeting Date <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="date"
                                  type="date"
                                  value={formData.date}
                                  onChange={(e) =>
                                    setFormData({ ...formData, date: e.target.value })
                                  }
                                  required
                                  className="h-10 rounded-lg"
                                />
                              </div>
                            </div>

                            {/* 4th line: Meeting Time */}
                            <div className="space-y-1.5">
                              <Label htmlFor="time" className="text-sm font-medium text-foreground">
                                Meeting Time <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="time"
                                type="time"
                                value={formData.time}
                                onChange={(e) =>
                                  setFormData({ ...formData, time: e.target.value })
                                }
                                required
                                className="h-10 rounded-lg"
                              />
                            </div>

                            {/* 5th line: Meeting Note */}
                            <div className="space-y-1.5">
                              <Label htmlFor="note" className="text-sm font-medium text-foreground">
                                Meeting Note
                              </Label>
                              <Textarea
                                id="note"
                                value={formData.note}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                  setFormData({ ...formData, note: e.target.value })
                                }
                                rows={3}
                                placeholder="Optional notes or agenda..."
                                className="min-h-[80px] rounded-lg resize-y text-base"
                              />
                            </div>
                          </div>

                          <DialogFooter className="flex flex-row justify-end gap-3 border-t border-border/60 pt-6 mt-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleDialogOpenChange(false)}
                              className="min-w-[80px] h-9 rounded-lg"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              variant="blue"
                              className="min-w-[100px] h-9 rounded-lg shadow-none"
                              disabled={saving}
                            >
                              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
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
                          onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                          className="h-9 border-0 bg-gray-50 pl-9 pr-9 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0"
                        />
                        {searchTerm.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                            onClick={() => {
                            setSearchTerm('');
                            setCurrentPage(1);
                          }}
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
                          {loading ? (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="px-6 text-center py-8 text-muted-foreground"
                              >
                                Loading meetings...
                              </TableCell>
                            </TableRow>
                          ) : paginatedData.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                className="px-6 text-center py-8 text-muted-foreground"
                              >
                                No meetings found
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedData.map((meeting) => (
                              <TableRow key={meeting.id}>
                                <TableCell className="px-6 font-medium">{meeting.title}</TableCell>
                                <TableCell className="px-6">{getBranchLabel(meeting.branch)}</TableCell>
                                <TableCell className="px-6">{getDepartmentLabel(meeting.department)}</TableCell>
                                <TableCell className="px-6">
                                  {meeting.employeeName ?? getEmployeeName(meeting.employeeId)}
                                </TableCell>
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
                    <div className="flex items-center justify-between gap-4 px-4 py-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Rows per page</span>
                          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                            <SelectTrigger className="w-20 px-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="min-w-[60px]">
                              <SelectItem value="5" className="justify-center">5</SelectItem>
                              <SelectItem value="10" className="justify-center">10</SelectItem>
                              <SelectItem value="20" className="justify-center">20</SelectItem>
                              <SelectItem value="50" className="justify-center">50</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="h-8 w-8">
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-muted-foreground px-2">Page {currentPage} of {totalPages}</span>
                          <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="h-8 w-8">
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
            <AlertDialogTitle>Delete meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{meetingToDelete?.title}&quot; will be permanently deleted. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700"
              disabled={saving}
            >
              {saving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
