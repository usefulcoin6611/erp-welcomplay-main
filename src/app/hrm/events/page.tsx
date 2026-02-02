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
import { Plus, Pencil, Trash2, Calendar as CalendarIcon, User } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { EventCalendar } from '@/components/event-calendar';
import { getEmployeesList } from '@/lib/employee-data';

interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  color: string;
  branch: string;
  department: string;
  employeeId: string;
  description: string;
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

const COLORS = ['blue', 'green', 'purple', 'red', 'orange', 'yellow'];
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

const initialEvents: Event[] = [
  {
    id: '1',
    title: 'Company Annual Meeting',
    startDate: '2024-03-20',
    endDate: '2024-03-20',
    color: 'blue',
    branch: 'main',
    department: 'hr',
    employeeId: '2',
    description: 'Annual company meeting to discuss yearly goals',
  },
  {
    id: '2',
    title: 'Team Building Event',
    startDate: '2024-03-25',
    endDate: '2024-03-26',
    color: 'green',
    branch: 'main',
    department: 'hr',
    employeeId: '1',
    description: 'Two-day team building activities',
  },
  {
    id: '3',
    title: 'Product Launch',
    startDate: '2024-04-01',
    endDate: '2024-04-01',
    color: 'purple',
    branch: 'branch-office',
    department: 'marketing',
    employeeId: '5',
    description: 'Launch event for new product line',
  },
];

const statCardClass = 'rounded-lg border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]';

function getColorClass(color: string) {
  const map: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
    green: 'bg-green-100 text-green-800 border-l-4 border-green-500',
    purple: 'bg-purple-100 text-purple-800 border-l-4 border-purple-500',
    red: 'bg-red-100 text-red-800 border-l-4 border-red-500',
    orange: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500',
    yellow: 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500',
  };
  return map[color] || 'bg-gray-100 text-gray-800 border-l-4 border-gray-500';
}

const employeesList = getEmployeesList();

function getBranchLabel(value: string) {
  return (BRANCHES.find((b) => b.value === value)?.label ?? value) || '-';
}
function getDepartmentLabel(value: string) {
  return (DEPARTMENTS.find((d) => d.value === value)?.label ?? value) || '-';
}
function getEmployeeName(employeeId: string) {
  return employeesList.find((e) => e.id.toString() === employeeId)?.name ?? '-';
}

export default function EventSetupPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const handleDialogOpenChange = (open: boolean) => {
    setShowForm(open);
    if (!open) {
      setEditingId(null);
      setFormData({ ...defaultFormData });
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({ ...defaultFormData });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setEvents((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: formData.title,
                startDate: formData.startDate,
                endDate: formData.endDate,
                color: formData.color,
                branch: formData.branch,
                department: formData.department,
                employeeId: formData.employeeId,
                description: formData.description,
              }
            : item
        )
      );
    } else {
      const newItem: Event = {
        id: Date.now().toString(),
        title: formData.title,
        startDate: formData.startDate,
        endDate: formData.endDate,
        color: formData.color,
        branch: formData.branch,
        department: formData.department,
        employeeId: formData.employeeId,
        description: formData.description,
      };
      setEvents((prev) => [newItem, ...prev]);
    }
    handleDialogOpenChange(false);
  };

  const handleEdit = (item: Event) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      startDate: item.startDate,
      endDate: item.endDate,
      color: item.color,
      branch: item.branch,
      department: item.department,
      employeeId: item.employeeId,
      description: item.description,
    });
    setShowForm(true);
  };

  const openDeleteConfirm = (event: Event) => {
    setEventToDelete(event);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (eventToDelete) {
      setEvents((prev) => prev.filter((item) => item.id !== eventToDelete.id));
      setEventToDelete(null);
    }
    setDeleteAlertOpen(false);
  };

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((e) => new Date(e.startDate) >= new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()),
    [events]
  );

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
                    <CardHeader className="flex flex-row items-center justify-end space-y-0 px-6 py-3.5">
                      <Button
                        onClick={handleAdd}
                        size="sm"
                        className="h-8 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                      </Button>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 pt-0">
                      <EventCalendar events={calendarEvents} />
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] h-full">
                    <CardHeader className="px-6 py-3.5">
                      <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pt-0 pb-6">
                      <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {upcomingEvents.length === 0 ? (
                          <p className="text-center py-8 text-muted-foreground text-sm">Tidak ada event mendatang</p>
                        ) : (
                          upcomingEvents.map((event) => (
                            <Card key={event.id} className={getColorClass(event.color)}>
                              <CardContent className="pt-4 pb-4 px-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h4 className="font-semibold text-sm leading-tight">{event.title}</h4>
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
                                <div className="space-y-1 text-xs text-muted-foreground">
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
                          ))
                        )}
                      </div>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Event' : 'Create Event'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Ubah detail event.' : 'Buat event baru. Isi field yang wajib.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Event Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Pilih branch" />
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
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Pilih department" />
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
                  <Label htmlFor="employeeId">PIC / Employee</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                  >
                    <SelectTrigger id="employeeId">
                      <SelectValue placeholder="Pilih PIC" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeesList.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.name} ({emp.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color Label</Label>
                  <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                    <SelectTrigger id="color">
                      <SelectValue placeholder="Pilih warna" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${COLOR_DOT_CLASS[color] || 'bg-gray-500'}`} />
                            <span className="capitalize">{color}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Deskripsi event..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="blue" className="shadow-none">
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
