'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Calendar, Clock, Eye } from 'lucide-react';
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
import { getInterviewsList, addInterview, updateInterview, removeInterviewById, type InterviewScheduleDetail } from '@/lib/recruitment-data';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

export function InterviewScheduleContent() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    candidateName: '',
    position: '',
    interviewDate: '',
    interviewTime: '',
    interviewer: '',
    location: '',
    status: '',
    notes: '',
  });
  const [schedules, setSchedules] = useState<InterviewScheduleDetail[]>(() => getInterviewsList());

  const refreshSchedules = () => setSchedules([...getInterviewsList()]);

  const openDeleteConfirm = (id: string) => {
    setDeleteScheduleId(id);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteScheduleId) {
      removeInterviewById(deleteScheduleId);
      refreshSchedules();
      setDeleteScheduleId(null);
    }
    setDeleteAlertOpen(false);
  };

  const interviewers = ['Sarah Johnson', 'Emily Davis', 'David Lee', 'Michael Brown'];
  const locations = ['Meeting Room A', 'Meeting Room B', 'Video Call', 'Phone Call'];
  const statuses = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      candidateName: '',
      position: '',
      interviewDate: '',
      interviewTime: '',
      interviewer: '',
      location: '',
      status: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateInterview(editingId, {
        candidateName: formData.candidateName,
        position: formData.position,
        interviewDate: formData.interviewDate,
        interviewTime: formData.interviewTime,
        interviewer: formData.interviewer,
        location: formData.location,
        status: formData.status,
      });
    } else {
      addInterview({
        candidateName: formData.candidateName,
        position: formData.position,
        interviewDate: formData.interviewDate,
        interviewTime: formData.interviewTime,
        interviewer: formData.interviewer,
        location: formData.location,
        status: formData.status,
      });
    }
    refreshSchedules();
    setShowForm(false);
  };

  const handleEdit = (item: InterviewScheduleDetail) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="candidateName">Candidate Name</Label>
                  <Input
                    id="candidateName"
                    value={formData.candidateName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, candidateName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

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
                    type="time"
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
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
                  {editingId ? 'Update' : 'Schedule'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
            <AlertDialogAction type="button" onClick={handleDeleteConfirm}>
              <span>Hapus</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
