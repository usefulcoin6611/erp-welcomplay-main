'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Star, Eye, Loader2 } from 'lucide-react';
import { StarRatingDisplay } from '../StarRatingDisplay';
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

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

interface Appraisal {
  id: string;
  branch: string;
  department: string;
  designation: string;
  employee: string;
  targetRating: number;
  overallRating: number;
  appraisalDate: string;
  period?: string;
}

export function AppraisalContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    branch: '',
    employee: '',
    appraisalDate: '',
    technicalRating: '',
    leadershipRating: '',
    teamworkRating: '',
    communicationRating: '',
    remarks: '',
  });

  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<
    { id: string; name: string; branch: string; department: string; designation: string }[]
  >([]);
  const [viewItem, setViewItem] = useState<Appraisal | null>(null);

  const fetchAppraisals = useCallback(async () => {
    try {
      const res = await fetch('/api/hrm/performance/appraisals');
      const json = await res.json();
      if (json.success && Array.isArray(json.data))
        setAppraisals(
          json.data.map((a: { employee?: string; employeeId: string } & Appraisal) => ({
            ...a,
            employee: a.employee ?? '',
          }))
        );
      else toast.error(json.message ?? 'Gagal memuat appraisal');
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat appraisal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAppraisals(); }, [fetchAppraisals]);

  useEffect(() => {
    (async () => {
      try {
        const [bRes, eRes] = await Promise.all([fetch('/api/branches'), fetch('/api/hrm/assets/employees')]);
        const bJson = await bRes.json();
        const eJson = await eRes.json();
        if (bJson.success && Array.isArray(bJson.data)) setBranches(bJson.data);
        if (eJson.success && Array.isArray(eJson.data)) setEmployees(eJson.data);
      } catch (_e) {}
    })();
  }, []);

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      branch: '',
      employee: '',
      appraisalDate: '',
      technicalRating: '',
      leadershipRating: '',
      teamworkRating: '',
      communicationRating: '',
      remarks: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedEmployee = employees.find((emp) => emp.id === formData.employee);
      const existingAppraisal = editingId ? appraisals.find((a) => a.id === editingId) : undefined;

      const department = selectedEmployee?.department ?? existingAppraisal?.department ?? '';
      const designation = selectedEmployee?.designation ?? existingAppraisal?.designation ?? '';

      const payload = {
        employeeId: formData.employee,
        branch: formData.branch || selectedEmployee?.branch || '',
        department,
        designation,
        targetRating: 4,
        appraisalDate: formData.appraisalDate,
        technicalRating: formData.technicalRating ? parseFloat(formData.technicalRating) : undefined,
        leadershipRating: formData.leadershipRating ? parseFloat(formData.leadershipRating) : undefined,
        teamworkRating: formData.teamworkRating ? parseFloat(formData.teamworkRating) : undefined,
        communicationRating: formData.communicationRating ? parseFloat(formData.communicationRating) : undefined,
        remarks: formData.remarks || undefined,
      };
      const url = editingId ? `/api/hrm/performance/appraisals/${editingId}` : '/api/hrm/performance/appraisals';
      const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? (editingId ? 'Appraisal berhasil diperbarui' : 'Appraisal berhasil dibuat'));
        setShowForm(false);
        setEditingId(null);
        fetchAppraisals();
      } else toast.error(json.message ?? 'Gagal menyimpan');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Appraisal & { employeeId?: string }) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      branch: item.branch,
      employee: (item as { employeeId?: string }).employeeId ?? item.employee ?? '',
      appraisalDate: item.appraisalDate,
      technicalRating: '',
      leadershipRating: '',
      teamworkRating: '',
      communicationRating: '',
      remarks: '',
    });
  };

  const openDelete = (id: string) => setDeleteId(id);
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/hrm/performance/appraisals/${deleteId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? 'Appraisal berhasil dihapus');
        setDeleteId(null);
        fetchAppraisals();
      } else toast.error(json.message ?? 'Gagal menghapus');
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus');
    } finally {
      setDeleting(false);
    }
  };

  const handleView = (id: string) => {
    const item = appraisals.find((appraisal) => appraisal.id === id);
    if (!item) {
      toast.error('Appraisal tidak ditemukan');
      return;
    }
    setViewItem(item);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filteredData = appraisals.filter(
    (appraisal) =>
      appraisal.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraisal.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraisal.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Appraisals</p>
                <p className="text-2xl font-bold">{appraisals.length}</p>
              </div>
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-blue-600">
                  {appraisals.length > 0
                    ? (appraisals.reduce((sum, app) => sum + app.overallRating, 0) / appraisals.length).toFixed(1)
                    : '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exceeded Target</p>
                <p className="text-2xl font-bold text-green-600">
                  {appraisals.filter((app) => app.overallRating >= app.targetRating).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Below Target</p>
                <p className="text-2xl font-bold text-red-600">
                  {appraisals.filter((app) => app.overallRating < app.targetRating).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end items-center">
        <Button onClick={handleAdd} className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
          <Plus className="w-4 h-4 mr-2" />
          Create Appraisal
        </Button>
      </div>

      {/* Add/Edit Modal */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          if (submitting) return;
          setShowForm(open);
          if (!open) {
            setEditingId(null);
            setFormData({
              branch: '',
              employee: '',
              appraisalDate: '',
              technicalRating: '',
              leadershipRating: '',
              teamworkRating: '',
              communicationRating: '',
              remarks: '',
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit' : 'Create New'} Appraisal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
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
                <Label htmlFor="employee">Employee</Label>
                <Select
                  value={formData.employee}
                  onValueChange={(value) => {
                    const emp = employees.find((e) => e.id === value);
                    setFormData({
                      ...formData,
                      employee: value,
                      branch: emp?.branch ?? formData.branch,
                    });
                  }}
                >
                  <SelectTrigger>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="appraisalDate">Appraisal Date</Label>
                <Input
                  id="appraisalDate"
                  type="date"
                  value={formData.appraisalDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, appraisalDate: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="technicalRating">Technical Skills (1-5)</Label>
                <Input
                  id="technicalRating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.technicalRating}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, technicalRating: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadershipRating">Leadership (1-5)</Label>
                <Input
                  id="leadershipRating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.leadershipRating}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, leadershipRating: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamworkRating">Teamwork (1-5)</Label>
                <Input
                  id="teamworkRating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.teamworkRating}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, teamworkRating: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="communicationRating">Communication (1-5)</Label>
                <Input
                  id="communicationRating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.communicationRating}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, communicationRating: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Input
                id="remarks"
                value={formData.remarks}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
              />
            </div>

            <DialogFooter className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700 shadow-none"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={submitting}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Detail Modal */}
      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Appraisal Detail</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Branch</p>
                  <p className="text-sm font-medium">{viewItem.branch}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm font-medium">{viewItem.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Designation</p>
                  <p className="text-sm font-medium">{viewItem.designation}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Employee</p>
                  <p className="text-sm font-medium">{viewItem.employee}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Appraisal Date</p>
                  <p className="text-sm font-medium">{viewItem.appraisalDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Period</p>
                  <p className="text-sm font-medium">{viewItem.period ?? '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Overall Rating</p>
                <StarRatingDisplay rating={viewItem.overallRating} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Target Rating</p>
                <p className="text-sm font-medium">{viewItem.targetRating.toFixed(1)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus appraisal?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Appraisal List - reference: appraisal/index */}
      <Card className={cardClass}>
        <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-medium">Manage Appraisal</h3>
          <div className="relative w-full max-w-[280px] ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by branch, employee, or department..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3">Branch</TableHead>
                <TableHead className="px-4 py-3">Department</TableHead>
                <TableHead className="px-4 py-3">Designation</TableHead>
                <TableHead className="px-4 py-3">Employee</TableHead>
                <TableHead className="px-4 py-3 text-center">Target Rating</TableHead>
                <TableHead className="px-4 py-3 text-center">Overall Rating</TableHead>
                <TableHead className="px-4 py-3">Appraisal Date</TableHead>
                <TableHead className="px-4 py-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground px-4 py-3">
                    No appraisals found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((appraisal) => (
                  <TableRow key={appraisal.id}>
                    <TableCell className="px-4 py-3 font-medium">{appraisal.branch}</TableCell>
                    <TableCell className="px-4 py-3">{appraisal.department}</TableCell>
                    <TableCell className="px-4 py-3">{appraisal.designation}</TableCell>
                    <TableCell className="px-4 py-3">{appraisal.employee}</TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <StarRatingDisplay rating={appraisal.targetRating} />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <StarRatingDisplay rating={appraisal.overallRating} />
                    </TableCell>
                    <TableCell className="px-4 py-3">{appraisal.appraisalDate}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(appraisal.id)}
                          title="View"
                          className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(appraisal)}
                          title="Edit"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDelete(appraisal.id)}
                          title="Delete"
                          className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
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
  );
}
