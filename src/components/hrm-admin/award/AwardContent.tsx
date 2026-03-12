'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Award } from 'lucide-react';
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

const statCardClass = 'rounded-lg border border-gray-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]';
const tabColor = { iconBg: 'bg-amber-100', iconText: 'text-amber-600', accent: 'text-amber-600' };

interface AwardRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  awardTypeId: string;
  awardType: string;
  date: string;
  gift: string;
  description: string;
}

const emptyForm = {
  employeeId: '',
  awardTypeId: '',
  date: '',
  gift: '',
  description: '',
};

export function AwardContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [awards, setAwards] = useState<AwardRecord[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [awardTypes, setAwardTypes] = useState<{ id: string; name: string }[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.employeeId?.trim()) {
      errors.employeeId = 'Employee is required';
    }
    if (!formData.awardTypeId?.trim()) {
      errors.awardTypeId = 'Award type is required';
    }
    if (!formData.date?.trim()) {
      errors.date = 'Award date is required';
    } else {
      const d = new Date(formData.date);
      if (Number.isNaN(d.getTime())) {
        errors.date = 'Invalid date';
      }
    }
    const giftTrimmed = formData.gift?.trim();
    if (!giftTrimmed) {
      errors.gift = 'Gift is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [awardsRes, employeesRes, typesRes] = await Promise.all([
        fetch('/api/hrm/admin/awards'),
        fetch('/api/hrm/admin/employees'),
        fetch('/api/hrm/admin/award-types'),
      ]);
      const awardsJson = await awardsRes.json();
      const employeesJson = await employeesRes.json();
      const typesJson = await typesRes.json();
      if (awardsJson?.success && Array.isArray(awardsJson.data)) setAwards(awardsJson.data);
      if (employeesJson?.success && Array.isArray(employeesJson.data)) setEmployees(employeesJson.data);
      if (typesJson?.success && Array.isArray(typesJson.data)) setAwardTypes(typesJson.data);
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
    if (!formData.employeeId || !formData.awardTypeId || !formData.date || !formData.gift) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/hrm/admin/awards/${editingId}` : '/api/hrm/admin/awards';
      const method = editingId ? 'PUT' : 'POST';
      const body = {
        employeeId: formData.employeeId.trim(),
        awardTypeId: formData.awardTypeId.trim(),
        date: formData.date.trim(),
        gift: formData.gift.trim(),
        description: formData.description?.trim() || undefined,
      };
      const res = await fetch(url, {
        method,
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

  const handleEdit = (item: AwardRecord) => {
    setEditingId(item.id);
    setFormData({
      employeeId: item.employeeId,
      awardTypeId: item.awardTypeId,
      date: item.date,
      gift: item.gift,
      description: item.description,
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
      const res = await fetch(`/api/hrm/admin/awards/${idToDelete}`, { method: 'DELETE' });
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

  const filteredData = awards.filter(
    (award) =>
      award.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      award.awardType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisYear = String(now.getFullYear());

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className={statCardClass}><CardContent className="pt-6"><p className="text-muted-foreground">Loading...</p></CardContent></Card>
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
                <p className="text-sm text-muted-foreground">Total Awards</p>
                <p className="text-2xl font-bold">{awards.length}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tabColor.iconBg}`}>
                <Award className={`w-5 h-5 ${tabColor.iconText}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={statCardClass}>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className={`text-2xl font-bold ${tabColor.accent}`}>
                {awards.filter((a) => a.date.startsWith(thisMonth)).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={statCardClass}>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">This Year</p>
              <p className={`text-2xl font-bold ${tabColor.accent}`}>
                {awards.filter((a) => a.date.startsWith(thisYear)).length}
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
                placeholder="Search by employee or award type..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="h-8 bg-gray-50 pl-9 pr-3 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
              />
            </div>
            <Dialog open={formDialogOpen} onOpenChange={handleFormDialogOpenChange}>
              <Button
                size="sm"
                type="button"
                className="h-8 px-4 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200 flex-shrink-0"
                onClick={handleAdd}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Award
              </Button>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? 'Edit Award' : 'Create New Award'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employeeId">Employee Name <span className="text-destructive">*</span></Label>
                      <Select
                        value={formData.employeeId}
                        onValueChange={(value) => {
                          setFormData({ ...formData, employeeId: value });
                          clearError('employeeId');
                        }}
                        required
                      >
                        <SelectTrigger id="employeeId" className={formErrors.employeeId ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select employee" />
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
                        <p className="text-sm text-destructive">{formErrors.employeeId}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="awardTypeId">Award Type <span className="text-destructive">*</span></Label>
                      <Select
                        value={formData.awardTypeId}
                        onValueChange={(value) => {
                          setFormData({ ...formData, awardTypeId: value });
                          clearError('awardTypeId');
                        }}
                        required
                      >
                        <SelectTrigger id="awardTypeId" className={formErrors.awardTypeId ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select award type" />
                        </SelectTrigger>
                        <SelectContent>
                          {awardTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.awardTypeId && (
                        <p className="text-sm text-destructive">{formErrors.awardTypeId}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Award Date <span className="text-destructive">*</span></Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFormData({ ...formData, date: e.target.value });
                          clearError('date');
                        }}
                        className={formErrors.date ? 'border-destructive' : ''}
                        aria-invalid={!!formErrors.date}
                        required
                      />
                      {formErrors.date && (
                        <p className="text-sm text-destructive">{formErrors.date}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gift">Gift <span className="text-destructive">*</span></Label>
                      <Input
                        id="gift"
                        value={formData.gift}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setFormData({ ...formData, gift: e.target.value });
                          clearError('gift');
                        }}
                        placeholder="e.g. Certificate + Bonus"
                        className={formErrors.gift ? 'border-destructive' : ''}
                        aria-invalid={!!formErrors.gift}
                        required
                      />
                      {formErrors.gift && (
                        <p className="text-sm text-destructive">{formErrors.gift}</p>
                      )}
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
                      placeholder="Optional description"
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Employee Name</TableHead>
                <TableHead className="px-6">Award Type</TableHead>
                <TableHead className="px-6">Date</TableHead>
                <TableHead className="px-6">Gift</TableHead>
                <TableHead className="px-6">Description</TableHead>
                <TableHead className="px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 text-center py-8 text-muted-foreground">
                    No awards found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((award) => (
                  <TableRow key={award.id}>
                    <TableCell className="px-6 font-medium">{award.employeeName}</TableCell>
                    <TableCell className="px-6">{award.awardType}</TableCell>
                    <TableCell className="px-6">{award.date}</TableCell>
                    <TableCell className="px-6">{award.gift}</TableCell>
                    <TableCell className="px-6 max-w-xs truncate">{award.description}</TableCell>
                    <TableCell className="px-6">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                          onClick={() => handleEdit(award)}
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                          onClick={() => handleDeleteClick(award.id)}
                          title="Delete"
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete award?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete?
            </AlertDialogDescription>
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
