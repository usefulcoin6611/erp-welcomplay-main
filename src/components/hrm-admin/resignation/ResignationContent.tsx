'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, UserMinus } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
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
import { toast } from 'sonner';

interface Resignation {
  id: string;
  employeeId: string;
  employeeName: string;
  noticeDate: string;
  lastWorkingDate: string;
  reason: string;
}

const statCardClass = 'rounded-lg border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]';
const tabColor = { iconBg: 'bg-rose-100', iconText: 'text-rose-600', accent: 'text-rose-600' };

const emptyForm = {
  employeeId: '',
  noticeDate: '',
  lastWorkingDate: '',
  reason: '',
};

export function ResignationContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Resignation[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.employeeId?.trim()) {
      errors.employeeId = 'Employee is required';
    }
    if (!formData.noticeDate?.trim()) {
      errors.noticeDate = 'Notice date is required';
    } else {
      const d = new Date(formData.noticeDate);
      if (Number.isNaN(d.getTime())) {
        errors.noticeDate = 'Invalid date';
      }
    }
    if (!formData.lastWorkingDate?.trim()) {
      errors.lastWorkingDate = 'Last working date is required';
    } else {
      const d = new Date(formData.lastWorkingDate);
      if (Number.isNaN(d.getTime())) {
        errors.lastWorkingDate = 'Invalid date';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resignationsRes, employeesRes] = await Promise.all([
        fetch('/api/hrm/admin/resignations'),
        fetch('/api/hrm/admin/employees'),
      ]);
      const [resignationsJson, employeesJson] = await Promise.all([
        resignationsRes.json(),
        employeesRes.json(),
      ]);
      if (resignationsJson?.success && Array.isArray(resignationsJson.data)) setData(resignationsJson.data);
      if (employeesJson?.success && Array.isArray(employeesJson.data)) setEmployees(employeesJson.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFormDialogOpenChange = (open: boolean) => {
    setFormDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setFormData(emptyForm);
      setFormErrors({});
    }
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

  const handleAdd = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/hrm/admin/resignations/${editingId}` : '/api/hrm/admin/resignations';
      const body = {
        employeeId: formData.employeeId.trim(),
        noticeDate: formData.noticeDate.trim(),
        lastWorkingDate: formData.lastWorkingDate.trim(),
        reason: formData.reason?.trim() || undefined,
      };
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        toast.error(json?.message ?? 'Failed to save');
        return;
      }
      toast.success(json?.message ?? 'Saved');
      handleFormDialogOpenChange(false);
      fetchData();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (d: Resignation) => {
    setEditingId(d.id);
    setFormData({
      employeeId: d.employeeId,
      noticeDate: d.noticeDate,
      lastWorkingDate: d.lastWorkingDate,
      reason: d.reason,
    });
    setFormDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!idToDelete) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/hrm/admin/resignations/${idToDelete}`, { method: 'DELETE' });
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

  const filteredData = data.filter((d) => d.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

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
                <p className="text-sm text-muted-foreground">Total Resignations</p>
                <p className="text-2xl font-bold">{data.length}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tabColor.iconBg}`}>
                <UserMinus className={`w-5 h-5 ${tabColor.iconText}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={statCardClass}>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className={`text-2xl font-bold ${tabColor.accent}`}>
                {data.filter((d) => d.noticeDate.startsWith(thisMonth)).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={statCardClass}>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className={`text-2xl font-bold ${tabColor.accent}`}>
                {data.filter((d) => new Date(d.lastWorkingDate) > now).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

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
              size="sm"
              type="button"
              className="h-8 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200 flex-shrink-0"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Resignation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Employee</TableHead>
                <TableHead className="px-6">Notice Date</TableHead>
                <TableHead className="px-6">Last Working Date</TableHead>
                <TableHead className="px-6">Reason</TableHead>
                <TableHead className="px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 text-center py-8 text-muted-foreground">
                    No resignations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="px-6 font-medium">{d.employeeName}</TableCell>
                    <TableCell className="px-6">{d.noticeDate}</TableCell>
                    <TableCell className="px-6">{d.lastWorkingDate}</TableCell>
                    <TableCell className="px-6 max-w-xs truncate">{d.reason}</TableCell>
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

      <Dialog open={formDialogOpen} onOpenChange={handleFormDialogOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Resignation' : 'Create New Resignation'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Employee Name <span className="text-destructive">*</span></Label>
              <Select
                value={formData.employeeId}
                onValueChange={(v) => {
                  setFormData({ ...formData, employeeId: v });
                  clearError('employeeId');
                }}
              >
                <SelectTrigger className={formErrors.employeeId ? 'border-destructive' : ''}>
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
              {formErrors.employeeId && (
                <p className="text-sm text-destructive">{formErrors.employeeId}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Notice Date <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={formData.noticeDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData({ ...formData, noticeDate: e.target.value });
                    clearError('noticeDate');
                  }}
                  className={formErrors.noticeDate ? 'border-destructive' : ''}
                  aria-invalid={!!formErrors.noticeDate}
                />
                {formErrors.noticeDate && (
                  <p className="text-sm text-destructive">{formErrors.noticeDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Last Working Date <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  value={formData.lastWorkingDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setFormData({ ...formData, lastWorkingDate: e.target.value });
                    clearError('lastWorkingDate');
                  }}
                  className={formErrors.lastWorkingDate ? 'border-destructive' : ''}
                  aria-invalid={!!formErrors.lastWorkingDate}
                />
                {formErrors.lastWorkingDate && (
                  <p className="text-sm text-destructive">{formErrors.lastWorkingDate}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                value={formData.reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                rows={3}
                placeholder="Optional reason"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleFormDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none" disabled={saving}>
                {editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setIdToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete resignation?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. Are you sure?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
