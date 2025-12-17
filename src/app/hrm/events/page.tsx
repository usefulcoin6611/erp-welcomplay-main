'use client';

import { useState } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Calendar as CalendarIcon, MapPin, Users } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  color: string;
  attendees: number;
  description: string;
}

export default function EventSetupPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    location: '',
    color: '',
    description: '',
  });

  // Mock data
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Company Annual Meeting',
      startDate: '2024-03-20',
      endDate: '2024-03-20',
      location: 'Main Conference Room',
      color: 'blue',
      attendees: 50,
      description: 'Annual company meeting to discuss yearly goals',
    },
    {
      id: '2',
      title: 'Team Building Event',
      startDate: '2024-03-25',
      endDate: '2024-03-26',
      location: 'Resort & Spa',
      color: 'green',
      attendees: 35,
      description: 'Two-day team building activities',
    },
    {
      id: '3',
      title: 'Product Launch',
      startDate: '2024-04-01',
      endDate: '2024-04-01',
      location: 'Exhibition Hall',
      color: 'purple',
      attendees: 100,
      description: 'Launch event for new product line',
    },
  ]);

  const colors = ['blue', 'green', 'purple', 'red', 'orange', 'yellow'];

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      title: '',
      startDate: '',
      endDate: '',
      location: '',
      color: '',
      description: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setEvents(
        events.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: formData.title,
                startDate: formData.startDate,
                endDate: formData.endDate,
                location: formData.location,
                color: formData.color,
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
        location: formData.location,
        color: formData.color,
        description: formData.description,
        attendees: 0,
      };
      setEvents([...events, newItem]);
    }
    setShowForm(false);
  };

  const handleEdit = (item: Event) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      title: item.title,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      color: item.color,
      description: item.description,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter((item) => item.id !== id));
    }
  };

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
      green: 'bg-green-100 text-green-800 border-l-4 border-green-500',
      purple: 'bg-purple-100 text-purple-800 border-l-4 border-purple-500',
      red: 'bg-red-100 text-red-800 border-l-4 border-red-500',
      orange: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500',
      yellow: 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-l-4 border-gray-500';
  };

  const upcomingEvents = events
    .filter((e) => new Date(e.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
            <h1 className="text-base font-medium">Event Setup</h1>
            <div className="ml-auto flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Events</p>
                    <p className="text-2xl font-bold">{events.length}</p>
                  </div>
                  <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming Events</p>
                    <p className="text-2xl font-bold text-blue-600">{upcomingEvents.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Attendees</p>
                    <p className="text-2xl font-bold text-green-600">{events.reduce((sum, e) => sum + e.attendees, 0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {
                        events.filter(
                          (e) =>
                            new Date(e.startDate).getMonth() === new Date().getMonth() &&
                            new Date(e.startDate).getFullYear() === new Date().getFullYear()
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Calendar Placeholder */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Calendar</h3>
                    <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 shadow-none">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </div>
                  <div className="bg-muted rounded-lg p-8 text-center">
                    <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Calendar view will be integrated here</p>
                    <p className="text-sm text-muted-foreground mt-2">Events will be displayed in an interactive calendar</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Events */}
            <div>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Upcoming Events</h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {upcomingEvents.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">No upcoming events</p>
                    ) : (
                      upcomingEvents.map((event) => (
                        <Card key={event.id} className={getColorClass(event.color)}>
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold">{event.title}</h4>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleEdit(event)} title="Edit">
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(event.id)}
                                  title="Delete"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span>
                                  {event.startDate}
                                  {event.startDate !== event.endDate && ` - ${event.endDate}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{event.attendees} attendees</span>
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
          </div>

          {/* Add/Edit Form */}
          {showForm && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create New'} Event</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, startDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="color">Color Label</Label>
                      <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded bg-${color}-500`}></div>
                                <span className="capitalize">{color}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                      placeholder="Event description..."
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
