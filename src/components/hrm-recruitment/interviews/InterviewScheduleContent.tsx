'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Calendar, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface InterviewSchedule {
  id: string;
  candidateName: string;
  position: string;
  interviewDate: string;
  interviewTime: string;
  interviewer: string;
  location: string;
  status: string;
}

export function InterviewScheduleContent() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  // Mock data
  const [schedules, setSchedules] = useState<InterviewSchedule[]>([
    {
      id: '1',
      candidateName: 'John Smith',
      position: 'Senior Software Engineer',
      interviewDate: '2024-03-15',
      interviewTime: '10:00',
      interviewer: 'Sarah Johnson',
      location: 'Meeting Room A',
      status: 'Scheduled',
    },
    {
      id: '2',
      candidateName: 'Mike Brown',
      position: 'Marketing Manager',
      interviewDate: '2024-03-16',
      interviewTime: '14:00',
      interviewer: 'Emily Davis',
      location: 'Video Call',
      status: 'Scheduled',
    },
    {
      id: '3',
      candidateName: 'Lisa Wilson',
      position: 'Accountant',
      interviewDate: '2024-03-12',
      interviewTime: '11:00',
      interviewer: 'David Lee',
      location: 'Meeting Room B',
      status: 'Completed',
    },
  ]);

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
      setSchedules(
        schedules.map((item) =>
          item.id === editingId
            ? {
                ...item,
                candidateName: formData.candidateName,
                position: formData.position,
                interviewDate: formData.interviewDate,
                interviewTime: formData.interviewTime,
                interviewer: formData.interviewer,
                location: formData.location,
                status: formData.status,
              }
            : item
        )
      );
    } else {
      const newItem: InterviewSchedule = {
        id: Date.now().toString(),
        candidateName: formData.candidateName,
        position: formData.position,
        interviewDate: formData.interviewDate,
        interviewTime: formData.interviewTime,
        interviewer: formData.interviewer,
        location: formData.location,
        status: formData.status,
      };
      setSchedules([...schedules, newItem]);
    }
    setShowForm(false);
  };

  const handleEdit = (item: InterviewSchedule) => {
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

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this interview schedule?')) {
      setSchedules(schedules.filter((item) => item.id !== id));
    }
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Interviews</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
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
        <Card>
          <CardContent className="pt-6">
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
        <Card>
          <CardContent className="pt-6">
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

      {/* Add Button */}
      <div className="flex justify-end items-center">
        <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 shadow-none">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
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
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none">
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

      {/* Upcoming Interviews */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Interviews</h3>
          <div className="space-y-3">
            {upcomingSchedules.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No upcoming interviews</p>
            ) : (
              upcomingSchedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardContent className="pt-6">
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
                        <Button size="sm" variant="outline" onClick={() => handleEdit(schedule)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(schedule.id)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
                        >
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
    </div>
  );
}
