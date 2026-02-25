'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Megaphone } from 'lucide-react';
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

interface Announcement {
  id: string;
  title: string;
  branch: string;
  department: string;
  startDate: string;
  endDate: string;
  description: string;
  status: string;
}

const statCardClass = 'rounded-lg border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]';
const tabColor = { iconBg: 'bg-purple-100', iconText: 'text-purple-600', accent: 'text-purple-600' };

export function AnnouncementContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Announcement[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    branch: '',
    department: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [announcementsRes, branchesRes, deptsRes] = await Promise.all([
        fetch('/api/hrm/admin/announcements'),
        fetch('/api/hrm/admin/branches'),
        fetch('/api/hrm/admin/departments'),
      ]);
      const [announcementsJson, branchesJson, deptsJson] = await Promise.all([
        announcementsRes.json(),
        branchesRes.json(),
        deptsRes.json(),
      ]);
      if (announcementsJson?.success && Array.isArray(announcementsJson.data)) setData(announcementsJson.data);
      if (branchesJson?.success && Array.isArray(branchesJson.data)) setBranches(branchesJson.data);
      if (deptsJson?.success && Array.isArray(deptsJson.data)) setDepartments(deptsJson.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      title: '',
      branch: '',
      department: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.branch || !formData.department || !formData.startDate || !formData.endDate) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/hrm/admin/announcements/${editingId}` : '/api/hrm/admin/announcements';
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        toast.error(json?.message ?? 'Failed to save');
        return;
      }
      toast.success(json?.message ?? 'Saved');
      setShowForm(false);
      fetchData();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (d: Announcement) => {
    setShowForm(true);
    setEditingId(d.id);
    setFormData({
      title: d.title,
      branch: d.branch,
      department: d.department,
      startDate: d.startDate,
      endDate: d.endDate,
      description: d.description,
    });
  };

  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!idToDelete) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hrm/admin/announcements/${idToDelete}`, { method: 'DELETE' });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        toast.error(json?.message ?? 'Failed to delete');
        return;
      }
      toast.success('Deleted');
      setIdToDelete(null);
      setDeleteDialogOpen(false);
      fetchData();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  const filteredData = data.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className={statCardClass}>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className={statCardClass}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Announcements</p>
                <p className="text-2xl font-bold">{data.length}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tabColor.iconBg}`}>
                <Megaphone className={`w-5 h-5 ${tabColor.iconText}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={statCardClass}>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className={`text-2xl font-bold ${tabColor.accent}`}>
                {data.filter((d) => d.status === 'Active').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={statCardClass}>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Expired</p>
              <p className={`text-2xl font-bold ${tabColor.accent}`}>
                {data.filter((d) => d.status === 'Expired').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Announcement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Branch</Label>
                  <Select value={formData.branch} onValueChange={(v) => setFormData({ ...formData, branch: v })}>
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                    <SelectTrigger>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none" disabled={saving}>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-end space-y-0 px-6 py-3.5">
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative w-56 sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="h-8 bg-gray-50 pl-9 pr-3 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              />
            </div>
            <Button
              onClick={handleAdd}
              size="sm"
              className="h-8 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200 flex-shrink-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Title</TableHead>
                <TableHead className="px-6">Branch</TableHead>
                <TableHead className="px-6">Department</TableHead>
                <TableHead className="px-6">Start Date</TableHead>
                <TableHead className="px-6">End Date</TableHead>
                <TableHead className="px-6">Status</TableHead>
                <TableHead className="px-6">Description</TableHead>
                <TableHead className="px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-6 text-center py-8 text-muted-foreground">
                    No announcements found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="px-6 font-medium">{d.title}</TableCell>
                    <TableCell className="px-6">{d.branch}</TableCell>
                    <TableCell className="px-6">{d.department}</TableCell>
                    <TableCell className="px-6">{d.startDate}</TableCell>
                    <TableCell className="px-6">{d.endDate}</TableCell>
                    <TableCell className="px-6">
                      <Badge className={d.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {d.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 max-w-xs truncate">{d.description}</TableCell>
                    <TableCell className="px-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                          onClick={() => handleEdit(d)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                          onClick={() => handleDeleteClick(d.id)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setIdToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. Are you sure?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
