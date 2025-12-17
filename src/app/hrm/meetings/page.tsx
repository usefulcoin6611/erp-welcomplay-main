'use client';

import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Calendar as CalendarIcon, Clock, Users, Video } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  attendees: string[];
  location: string;
  status: string;
}

export default function MeetingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: '',
    type: '',
    location: '',
    notes: '',
  });

  // Mock data
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Weekly Team Standup',
      date: '2024-03-20',
      time: '09:00',
      duration: 30,
      type: 'Internal',
      attendees: ['John Doe', 'Jane Smith', 'Bob Wilson'],
      location: 'Meeting Room A',
      status: 'Scheduled',
    },
    {
      id: '2',
      title: 'Client Presentation',
      date: '2024-03-21',
      time: '14:00',
      duration: 60,
      type: 'External',
      attendees: ['Sarah Johnson', 'Mike Brown'],
      location: 'Video Call',
      status: 'Scheduled',
    },
    {
      id: '3',
      title: 'Project Review',
      date: '2024-03-18',
      time: '10:00',
      duration: 45,
      type: 'Internal',
      attendees: ['Emily Davis', 'David Lee'],
      location: 'Conference Room',
      status: 'Completed',
    },
  ]);

  const meetingTypes = ['Internal', 'External', 'Board Meeting', 'Training'];
  const statuses = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      title: '',
      date: '',
      time: '',
      duration: '',
      type: '',
      location: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setMeetings(
        meetings.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: formData.title,
                date: formData.date,
                time: formData.time,
                duration: parseInt(formData.duration),
                type: formData.type,
                location: formData.location,
              }
            : item
        )
      );
    } else {
      const newItem: Meeting = {
        id: Date.now().toString(),
        title: formData.title,
        date: formData.date,
        time: formData.time,
        duration: parseInt(formData.duration),
        type: formData.type,
        attendees: [],
        location: formData.location,
        status: 'Scheduled',
      };
      setMeetings([...meetings, newItem]);
    }
    setShowForm(false);
  };

  const handleEdit = (item: Meeting) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      title: item.title,
      date: item.date,
      time: item.time,
      duration: item.duration.toString(),
      type: item.type,
      location: item.location,
      notes: '',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this meeting?')) {
      setMeetings(meetings.filter((item) => item.id !== id));
    }
  };

  const filteredData = meetings.filter(
    (meeting) =>
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const upcomingMeetings = meetings
    .filter((m) => m.status === 'Scheduled' && new Date(m.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Meetings</p>
                    <p className="text-2xl font-bold">{meetings.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {meetings.filter((m) => m.status === 'Scheduled').length}
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
                      {meetings.filter((m) => m.status === 'Completed').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Week</p>
                    <p className="text-2xl font-bold text-purple-600">{upcomingMeetings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Manage Meetings</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="shadow-none">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar View
              </Button>
              <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 shadow-none">
                <Plus className="w-4 h-4 mr-2" />
                Create Meeting
              </Button>
            </div>
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create New'} Meeting</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Meeting Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={formData.duration}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Meeting Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {meetingTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        required
                      />
                    </div>
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
                      placeholder="Meeting notes or agenda..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none">
                      {editingId ? 'Update' : 'Create'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Meetings */}
          {upcomingMeetings.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingMeetings.map((meeting) => (
                    <Card key={meeting.id} className="border-l-4 border-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{meeting.title}</h4>
                          <Badge className={getStatusBadgeColor(meeting.status)}>{meeting.status}</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{meeting.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>
                              {meeting.time} ({meeting.duration} min)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {meeting.location.includes('Video') ? (
                              <Video className="w-4 h-4" />
                            ) : (
                              <Users className="w-4 h-4" />
                            )}
                            <span>{meeting.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{meeting.attendees.length} attendees</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Meetings Table */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meeting Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No meetings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((meeting) => (
                      <TableRow key={meeting.id}>
                        <TableCell className="font-medium">{meeting.title}</TableCell>
                        <TableCell>{meeting.date}</TableCell>
                        <TableCell>{meeting.time}</TableCell>
                        <TableCell>{meeting.duration} min</TableCell>
                        <TableCell>{meeting.type}</TableCell>
                        <TableCell>{meeting.location}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(meeting.status)}>{meeting.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(meeting)} title="Edit">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(meeting.id)}
                              title="Delete"
                              className="text-red-600 hover:text-red-700"
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
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
