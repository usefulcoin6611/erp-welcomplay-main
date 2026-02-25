'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Calendar, Clock, Eye, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

type ScheduleItem = {
  id: string;
  candidateName: string;
  position: string;
  applicationId?: string;
  interviewDate: string;
  interviewTime: string;
  interviewer: string;
  location: string;
  status: string;
};

type ApplicationOption = { id: string; applicantName: string; jobTitle: string };

export function InterviewScheduleContent() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    applicationId: '',
    candidateName: '',
    position: '',
    interviewDate: '',
    interviewTime: '',
    interviewer: '',
    location: '',
    status: 'Scheduled',
    notes: '',
  });
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [applications, setApplications] = useState<ApplicationOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch('/api/hrm/recruitment/interviews');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setSchedules(json.data);
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat jadwal interview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    if (showForm && applications.length === 0) {
      fetch('/api/hrm/recruitment/applications')
        .then((r) => r.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data)) {
            setApplications(json.data.map((a: { id: string; applicantName: string; jobTitle: string }) => ({
              id: a.id,
              applicantName: a.applicantName,
              jobTitle: a.jobTitle,
            })));
          }
        });
    }
  }, [showForm, applications.length]);

  const refreshSchedules = () => fetchSchedules();

  const openDeleteConfirm = (id: string) => {
    setDeleteScheduleId(id);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteScheduleId) {
      setDeleteAlertOpen(false);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/hrm/recruitment/interviews/${deleteScheduleId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? 'Jadwal dihapus');
        refreshSchedules();
        setDeleteScheduleId(null);
        setDeleteAlertOpen(false);
      } else toast.error(json.message ?? 'Gagal menghapus');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus');
    } finally {
      setDeleting(false);
    }
  };

  const interviewers = ['Sarah Johnson', 'Emily Davis', 'David Lee', 'Michael Brown'];
  const locations = ['Meeting Room A', 'Meeting Room B', 'Video Call', 'Phone Call'];
  const statuses = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      applicationId: '',
      candidateName: '',
      position: '',
      interviewDate: '',
      interviewTime: '',
      interviewer: '',
      location: '',
      status: 'Scheduled',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/hrm/recruitment/interviews/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            interviewDate: formData.interviewDate,
            interviewTime: formData.interviewTime,
            interviewer: formData.interviewer,
            location: formData.location,
            status: formData.status,
          }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success(json.message ?? 'Jadwal berhasil diperbarui');
          refreshSchedules();
          setShowForm(false);
        } else toast.error(json.message ?? 'Gagal memperbarui');
      } else {
        if (!formData.applicationId) {
          toast.error('Pilih kandidat (lamaran)');
          setSubmitting(false);
          return;
        }
        const res = await fetch('/api/hrm/recruitment/interviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicationId: formData.applicationId,
            interviewDate: formData.interviewDate,
            interviewTime: formData.interviewTime,
            interviewer: formData.interviewer,
            location: formData.location,
            status: formData.status,
          }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success(json.message ?? 'Jadwal berhasil dibuat');
          refreshSchedules();
          setShowForm(false);
        } else toast.error(json.message ?? 'Gagal membuat jadwal');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: ScheduleItem) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      applicationId: item.applicationId ?? '',
      candidateName: item.candidateName,
      position: item.position,
      interviewDate: item.interviewDate,
      interviewTime: item.interviewTime,
      interviewer: item.interviewer,
      location: item.location,
      status: item.status,
      notes: '',
    });
  };

  const getStatusBadgeColor = (status: string) => {
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
  };

  const upcomingSchedules = schedules.filter((s) => s.status === 'Scheduled').sort((a, b) =>
    new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards - reference-erp interview schedule */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Interviews</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-blue-600">
                  {schedules.filter((s) => s.status === 'Scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {schedules.filter((s) => s.status === 'Completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {schedules.filter((s) => s.status === 'Cancelled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className={cardClass}>
          <CardContent className="px-6 pt-6 pb-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Schedule New'} Interview</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {editingId ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Candidate</Label>
                    <p className="text-sm text-foreground">{formData.candidateName} – {formData.position}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="applicationId">Kandidat (Lamaran)</Label>
                  <Select
                    value={formData.applicationId}
                    onValueChange={(value) => {
                      const app = applications.find((a) => a.id === value);
                      setFormData({
                        ...formData,
                        applicationId: value,
                        candidateName: app?.applicantName ?? '',
                        position: app?.jobTitle ?? '',
                      });
                    }}
                  >
                    <SelectTrigger id="applicationId">
                      <SelectValue placeholder="Pilih lamaran (kandidat)" />
                    </SelectTrigger>
                    <SelectContent>
                      {applications.map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.applicantName} – {app.jobTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interviewDate">Interview Date</Label>
                  <Input
                    id="interviewDate"
                    type="date"
                    value={formData.interviewDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, interviewDate: e.target.value })
                    }
                    required
                  />
                </div>
              <div className="space-y-2">
                <Label htmlFor="interviewTime">Interview Time</Label>
                <Input
                  id="interviewTime"
                  type="text"
                  placeholder="e.g. 10:00"
                  value={formData.interviewTime}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, interviewTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interviewer">Interviewer</Label>
                  <Select
                    value={formData.interviewer}
                    onValueChange={(value) => setFormData({ ...formData, interviewer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {interviewers.map((interviewer) => (
                        <SelectItem key={interviewer} value={interviewer}>
                          {interviewer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 shadow-none" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? 'Update' : 'Schedule')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Interview Schedule - satu card: header (title + Create), content (upcoming list) */}
      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6 pb-4">
          <CardTitle className="text-base font-semibold">Interview Schedule</CardTitle>
          <Button size="sm" className="h-9 shadow-none bg-blue-600 text-white hover:bg-blue-700" onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Schedule Interview
          </Button>
        </CardHeader>
        <CardContent className="px-6 pt-0">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Upcoming Interviews</h3>
          <div className="space-y-3">
            {upcomingSchedules.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No upcoming interviews</p>
            ) : (
              upcomingSchedules.map((schedule) => (
                <Card key={schedule.id} className={cardClass}>
                  <CardContent className="px-4 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{schedule.candidateName}</h4>
                          <Badge className={getStatusBadgeColor(schedule.status)}>{schedule.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{schedule.position}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{schedule.interviewDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{schedule.interviewTime}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Interviewer: {schedule.interviewer} | Location: {schedule.location}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => router.push(`/hrm/recruitment/interviews/${schedule.id}`)} title="View" className="h-7 shadow-none bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => router.push(`/hrm/recruitment/interviews/${schedule.id}/edit`)} title="Edit" className="h-7 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openDeleteConfirm(schedule.id)} title="Delete" className="h-7 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Interview Schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Jadwal interview akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2">
            <AlertDialogCancel type="button">Batal</AlertDialogCancel>
            <AlertDialogAction type="button" disabled={deleting} onClick={handleDeleteConfirm}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Hapus</span>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
