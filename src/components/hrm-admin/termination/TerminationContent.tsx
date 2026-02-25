'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, XCircle } from 'lucide-react';
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

interface Termination {
  id: string;
  employeeId: string;
  employeeName: string;
  terminationTypeId: string;
  terminationType: string;
  noticeDate: string;
  terminationDate: string;
  description: string;
}

const statCardClass = 'rounded-lg border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]';
const tabColor = { iconBg: 'bg-red-100', iconText: 'text-red-600', accent: 'text-red-600' };

export function TerminationContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Termination[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [terminationTypes, setTerminationTypes] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState({
    employeeId: '',
    terminationTypeId: '',
    noticeDate: '',
    terminationDate: '',
    description: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [terminationsRes, employeesRes, typesRes] = await Promise.all([
        fetch('/api/hrm/admin/terminations'),
        fetch('/api/hrm/admin/employees'),
        fetch('/api/hrm/admin/termination-types'),
      ]);
      const [terminationsJson, employeesJson, typesJson] = await Promise.all([
        terminationsRes.json(),
        employeesRes.json(),
        typesRes.json(),
      ]);
      if (terminationsJson?.success && Array.isArray(terminationsJson.data)) setData(terminationsJson.data);
      if (employeesJson?.success && Array.isArray(employeesJson.data)) setEmployees(employeesJson.data);
      if (typesJson?.success && Array.isArray(typesJson.data)) setTerminationTypes(typesJson.data);
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
      employeeId: '',
      terminationTypeId: '',
      noticeDate: '',
      terminationDate: '',
      description: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.employeeId ||
      !formData.terminationTypeId ||
      !formData.noticeDate ||
      !formData.terminationDate
    ) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/hrm/admin/terminations/${editingId}` : '/api/hrm/admin/terminations';
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

  const handleEdit = (d: Termination) => {
    setShowForm(true);
    setEditingId(d.id);
    setFormData({
      employeeId: d.employeeId,
      terminationTypeId: d.terminationTypeId,
      noticeDate: d.noticeDate,
      terminationDate: d.terminationDate,
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
      const res = await fetch(`/api/hrm/admin/terminations/${idToDelete}`, { method: 'DELETE' });
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
    d.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisYear = String(now.getFullYear());

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
                <p className="text-sm text-muted-foreground">Total Terminations</p>
                <p className="text-2xl font-bold">{data.length}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tabColor.iconBg}`}>
                <XCircle className={`w-5 h-5 ${tabColor.iconText}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={statCardClass}>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className={`text-2xl font-bold ${tabColor.accent}`}>
                {data.filter((d) => d.terminationDate.startsWith(thisMonth)).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={statCardClass}>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">This Year</p>
              <p className={`text-2xl font-bold ${tabColor.accent}`}>
                {data.filter((d) => d.terminationDate.startsWith(thisYear)).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create'} Termination</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Employee Name</Label>
                  <Select value={formData.employeeId} onValueChange={(v) => setFormData({ ...formData, employeeId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Termination Type</Label>
                  <Select
                    value={formData.terminationTypeId}
                    onValueChange={(v) => setFormData({ ...formData, terminationTypeId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {terminationTypes.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Notice Date</Label>
                  <Input
                    type="date"
                    value={formData.noticeDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, noticeDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Termination Date</Label>
                  <Input
                    type="date"
                    value={formData.terminationDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, terminationDate: e.target.value })
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
              Create Termination
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Employee</TableHead>
                <TableHead className="px-6">Type</TableHead>
                <TableHead className="px-6">Notice Date</TableHead>
                <TableHead className="px-6">Termination Date</TableHead>
                <TableHead className="px-6">Description</TableHead>
                <TableHead className="px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 text-center py-8 text-muted-foreground">
                    No terminations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="px-6 font-medium">{d.employeeName}</TableCell>
                    <TableCell className="px-6">{d.terminationType}</TableCell>
                    <TableCell className="px-6">{d.noticeDate}</TableCell>
                    <TableCell className="px-6">{d.terminationDate}</TableCell>
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
            <AlertDialogTitle>Delete termination?</AlertDialogTitle>
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
