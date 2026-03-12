'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { Plus, Pencil, Trash2, Calendar as CalendarIcon, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { EventCalendar } from '@/components/event-calendar';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  color: string;
  branch: string;
  department: string;
  employeeId: string | null;
  employeeName?: string;
  description: string;
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

const COLORS = ['blue', 'green', 'purple', 'red', 'orange', 'yellow'] as const;
const COLOR_DOT_CLASS: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
};

const defaultFormData = {
  title: '',
  startDate: '',
  endDate: '',
  color: COLORS[0],
  branch: '',
  department: '',
  employeeId: '',
  description: '',
};

const statCardClass =
  'rounded-lg border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]';

const COLOR_DOT_CLASS_UPCOMING: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
};

function getUpcomingCardDotClass(color: string) {
  return COLOR_DOT_CLASS_UPCOMING[color] || 'bg-gray-400';
}

export default function EventSetupPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const UPCOMING_PAGE_SIZES = [5, 10, 20, 50] as const;
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [upcomingPageSize, setUpcomingPageSize] = useState(10);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsRes, branchesRes, deptsRes, employeesRes] = await Promise.all([
        fetch('/api/hrm/events'),
        fetch('/api/branches'),
        fetch('/api/departments'),
        fetch('/api/hrm/admin/employees'),
      ]);

      const [eventsJson, branchesJson, deptsJson, employeesJson] = await Promise.all([
        eventsRes.json().catch(() => null),
        branchesRes.json().catch(() => null),
        deptsRes.json().catch(() => null),
        employeesRes.json().catch(() => null),
      ]);

      if (!eventsRes.ok || !eventsJson?.success) {
        toast.error(eventsJson?.message ?? 'Failed to load events');
      } else if (Array.isArray(eventsJson.data)) {
        setEvents(eventsJson.data);
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
      console.error('Error loading events data', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleDialogOpenChange = (open: boolean) => {
    setShowForm(open);
    if (!open) {
      setEditingId(null);
      setFormData({ ...defaultFormData });
      setFormErrors({});
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ ...defaultFormData });
    setFormErrors({});
    setShowForm(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim()) errors.title = 'Event title is required';
    if (!formData.branch.trim()) errors.branch = 'Branch is required';
    if (!formData.department.trim()) errors.department = 'Department is required';
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    } else if (Number.isNaN(new Date(formData.startDate).getTime())) {
      errors.startDate = 'Invalid start date';
    }
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    } else if (Number.isNaN(new Date(formData.endDate).getTime())) {
      errors.endDate = 'Invalid end date';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
        errors.endDate = 'End date must be after or equal to start date';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setSaving(true);
    const url = editingId ? `/api/hrm/events/${editingId}` : '/api/hrm/events';
    const method = editingId ? 'PUT' : 'POST';
    const body = {
      title: formData.title.trim(),
      branch: formData.branch.trim(),
      department: formData.department.trim(),
      employeeId: formData.employeeId || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      color: formData.color,
      description: formData.description?.trim() || undefined,
    };

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          toast.error(json?.message ?? 'Failed to save event');
          return;
        }
        toast.success(editingId ? 'Event updated' : 'Event created');
        handleDialogOpenChange(false);
        fetchInitialData();
      })
      .catch((error) => {
        console.error('Error saving event', error);
        toast.error('Failed to save event');
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleEdit = (item: Event) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      startDate: item.startDate,
      endDate: item.endDate,
      color: item.color || COLORS[0],
      branch: item.branch,
      department: item.department,
      employeeId: item.employeeId ?? '',
      description: item.description,
    });
    setFormErrors({});
    setShowForm(true);
  };

  const openDeleteConfirm = (event: Event) => {
    setEventToDelete(event);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!eventToDelete) {
      setDeleteAlertOpen(false);
      return;
    }
    setSaving(true);
    fetch(`/api/hrm/events/${eventToDelete.id}`, { method: 'DELETE' })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) {
          toast.error(json?.message ?? 'Failed to delete event');
          return;
        }
        toast.success('Event deleted');
        setEventToDelete(null);
        fetchInitialData();
      })
      .catch((error) => {
        console.error('Error deleting event', error);
        toast.error('Failed to delete event');
      })
      .finally(() => {
        setSaving(false);
        setDeleteAlertOpen(false);
      });
  };

  const getBranchLabel = (value: string) =>
    (branches.find((b) => b.name === value)?.name ?? value) || '-';
  const getDepartmentLabel = (value: string) =>
    (departments.find((d) => d.name === value)?.name ?? value) || '-';
  const getEmployeeName = (employeeId: string | null) =>
    employees.find((e) => e.id === employeeId)?.name ?? '-';

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((e) => new Date(e.startDate) >= new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
    [events]
  );

  const upcomingTotal = upcomingEvents.length;
  const upcomingTotalPages = Math.max(1, Math.ceil(upcomingTotal / upcomingPageSize));
  const upcomingPageClamped = Math.min(Math.max(1, upcomingPage), upcomingTotalPages);
  const upcomingPaginated = useMemo(
    () =>
      upcomingEvents.slice(
        (upcomingPageClamped - 1) * upcomingPageSize,
        upcomingPageClamped * upcomingPageSize
      ),
    [upcomingEvents, upcomingPageClamped, upcomingPageSize]
  );
  const upcomingStart = upcomingTotal === 0 ? 0 : (upcomingPageClamped - 1) * upcomingPageSize + 1;
  const upcomingEnd = Math.min(upcomingPageClamped * upcomingPageSize, upcomingTotal);

  useEffect(() => {
    if (upcomingPage > upcomingTotalPages) {
      setUpcomingPage(Math.max(1, upcomingTotalPages));
    }
  }, [upcomingTotalPages, upcomingPage]);

  const thisMonthCount = useMemo(
    () =>
      events.filter(
        (e) =>
          new Date(e.startDate).getMonth() === new Date().getMonth() &&
          new Date(e.startDate).getFullYear() === new Date().getFullYear()
      ).length,
    [events]
  );

  const calendarEvents = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.startDate,
        time: '09:00',
        type: 'other' as const,
        color: e.color,
      })),
    [events]
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
                <CardHeader className="px-6">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-semibold">Event Setup</CardTitle>
                    <CardDescription>
                      Kelola event perusahaan: rapat tahunan, team building, product launch, dan acara lainnya.
                    </CardDescription>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={handleAdd}
                      size="sm"
                      className="h-8 px-4 shadow-none bg-blue-500 text-white hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className={statCardClass}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Events</p>
                        <p className="text-2xl font-bold">{events.length}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-sky-100">
                        <CalendarIcon className="w-5 h-5 text-sky-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={statCardClass}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Upcoming</p>
                        <p className="text-2xl font-bold text-blue-600">{upcomingEvents.length}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                        <CalendarIcon className="w-5 h-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className={statCardClass}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">This Month</p>
                        <p className="text-2xl font-bold text-purple-600">{thisMonthCount}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
                        <CalendarIcon className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main content: Calendar + Upcoming */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-3.5">
                      <CardTitle className="text-base font-semibold">Calendar</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-0">
                      <EventCalendar events={calendarEvents} />
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] h-full flex flex-col">
                    <CardHeader className="px-6 py-3.5">
                      <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
                      {upcomingTotal > 0 && (
                        <p className="text-xs text-muted-foreground font-normal mt-0.5">
                          {upcomingTotal} event{upcomingTotal !== 1 ? 's' : ''} upcoming
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="px-6 pt-0 pb-4 flex flex-col flex-1 min-h-0">
                      {upcomingEvents.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground text-sm">
                          {loading ? 'Loading events...' : 'No upcoming events'}
                        </p>
                      ) : (
                        <>
                          {upcomingTotal > upcomingPageSize && (
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200/80">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  Per page
                                </span>
                                <Select
                                  value={String(upcomingPageSize)}
                                  onValueChange={(v) => {
                                    setUpcomingPageSize(Number(v));
                                    setUpcomingPage(1);
                                  }}
                                >
                                  <SelectTrigger className="h-8 w-[72px] rounded-md text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UPCOMING_PAGE_SIZES.map((size) => (
                                      <SelectItem key={size} value={String(size)}>
                                        {size}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span>
                                  {upcomingStart}&ndash;{upcomingEnd} of {upcomingTotal}
                                </span>
                                <div className="flex items-center gap-0.5">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    disabled={upcomingPageClamped <= 1}
                                    onClick={() => setUpcomingPage((p) => Math.max(1, p - 1))}
                                    aria-label="Previous page"
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 w-7 p-0"
                                    disabled={upcomingPageClamped >= upcomingTotalPages}
                                    onClick={() =>
                                      setUpcomingPage((p) => Math.min(upcomingTotalPages, p + 1))
                                    }
                                    aria-label="Next page"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="space-y-3 overflow-y-auto flex-1 min-h-0 max-h-[420px] pr-0.5">
                            {upcomingPaginated.map((event) => (
                              <Card
                                key={event.id}
                                className="border border-gray-200/80 bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
                              >
                                <CardContent className="pt-4 pb-4 px-4">
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <span
                                        className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${getUpcomingCardDotClass(event.color)}`}
                                        aria-hidden
                                      />
                                      <h4 className="font-semibold text-sm leading-tight text-foreground truncate">
                                        {event.title}
                                      </h4>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                                        onClick={() => handleEdit(event)}
                                        title="Edit"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 w-7 p-0 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                                        onClick={() => openDeleteConfirm(event)}
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-1 text-xs text-muted-foreground pl-4">
                                    <div className="flex items-center gap-2">
                                      <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                      <span>
                                        {event.startDate}
                                        {event.startDate !== event.endDate && ` - ${event.endDate}`}
                                      </span>
                                    </div>
                                    {(event.branch || event.department) && (
                                      <div className="flex items-center gap-2">
                                        <span>
                                          {[getBranchLabel(event.branch), getDepartmentLabel(event.department)]
                                            .filter(Boolean)
                                            .join(' · ')}
                                        </span>
                                      </div>
                                    )}
                                    {event.employeeId && (
                                      <div className="flex items-center gap-2">
                                        <User className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>PIC: {getEmployeeName(event.employeeId)}</span>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                          {upcomingTotal > upcomingPageSize && (
                            <p className="text-xs text-muted-foreground pt-2 text-center">
                              Page {upcomingPageClamped} of {upcomingTotalPages}
                            </p>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </MainContentWrapper>
        </div>
      </SidebarInset>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-6 sm:p-6 gap-0">
          <DialogHeader className="pb-6 text-left">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              {editingId ? 'Edit Event' : 'Create Event'}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-muted-foreground">
              {editingId ? 'Update event details below.' : 'Fill in the required fields to create a new event.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              {/* 1st line: Event Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-medium text-foreground">
                  Event Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    clearError('title');
                  }}
                  className={`h-10 rounded-lg ${formErrors.title ? 'border-destructive' : ''}`}
                  aria-invalid={!!formErrors.title}
                  placeholder="e.g. Company Annual Meeting"
                />
                {formErrors.title && (
                  <p className="text-sm text-destructive mt-1">{formErrors.title}</p>
                )}
              </div>

              {/* 2nd line: Branch & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="branch" className="text-sm font-medium text-foreground">
                    Branch <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) => {
                      setFormData({ ...formData, branch: value });
                      clearError('branch');
                    }}
                  >
                    <SelectTrigger
                      id="branch"
                      className={`h-10 rounded-lg ${formErrors.branch ? 'border-destructive' : ''}`}
                    >
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
                  {formErrors.branch && (
                    <p className="text-sm text-destructive mt-1">{formErrors.branch}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="department" className="text-sm font-medium text-foreground">
                    Department <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => {
                      setFormData({ ...formData, department: value });
                      clearError('department');
                    }}
                  >
                    <SelectTrigger
                      id="department"
                      className={`h-10 rounded-lg ${formErrors.department ? 'border-destructive' : ''}`}
                    >
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
                  {formErrors.department && (
                    <p className="text-sm text-destructive mt-1">{formErrors.department}</p>
                  )}
                </div>
              </div>

              {/* 3rd line: Employee & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="employeeId" className="text-sm font-medium text-foreground">
                    Employee
                  </Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, employeeId: value });
                      clearError('employeeId');
                    }}
                  >
                    <SelectTrigger
                      id="employeeId"
                      className={`h-10 rounded-lg ${formErrors.employeeId ? 'border-destructive' : ''}`}
                    >
                      <SelectValue placeholder="Select employee (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.employeeId && (
                    <p className="text-sm text-destructive mt-1">{formErrors.employeeId}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-sm font-medium text-foreground">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => {
                      setFormData({ ...formData, startDate: e.target.value });
                      clearError('startDate');
                    }}
                    className={`h-10 rounded-lg ${formErrors.startDate ? 'border-destructive' : ''}`}
                    aria-invalid={!!formErrors.startDate}
                  />
                  {formErrors.startDate && (
                    <p className="text-sm text-destructive mt-1">{formErrors.startDate}</p>
                  )}
                </div>
              </div>

              {/* 4th line: End Date & Color Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <Label htmlFor="endDate" className="text-sm font-medium text-foreground">
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData({ ...formData, endDate: e.target.value });
                      clearError('endDate');
                    }}
                    className={`h-10 rounded-lg ${formErrors.endDate ? 'border-destructive' : ''}`}
                    aria-invalid={!!formErrors.endDate}
                  />
                  {formErrors.endDate && (
                    <p className="text-sm text-destructive mt-1">{formErrors.endDate}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="color" className="text-sm font-medium text-foreground">
                    Color Label
                  </Label>
                  <Select
                    value={formData.color}
                    onValueChange={(value) =>
                      setFormData({ ...formData, color: value as (typeof COLORS)[number] })
                    }
                  >
                    <SelectTrigger id="color" className="h-10 rounded-lg">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full ${COLOR_DOT_CLASS[color] || 'bg-gray-500'}`}
                            />
                            <span className="capitalize">{color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 5th line: Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium text-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Optional description or notes..."
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
                variant="default"
                className="min-w-[100px] h-9 rounded-lg bg-blue-500 text-white hover:bg-blue-600 shadow-sm"
                disabled={saving}
              >
                {editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Event?</AlertDialogTitle>
            <AlertDialogDescription>
              Event &quot;{eventToDelete?.title}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700"
              disabled={saving}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
