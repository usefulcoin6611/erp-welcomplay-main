'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Eye, GraduationCap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface Training {
  id: string;
  branch: string;
  trainerOption: string;
  trainingType: string;
  status: string;
  employee: string;
  trainer: string;
  startDate: string;
  endDate: string;
  cost: number;
  description?: string;
  trainingTypeId?: string;
  employeeId?: string;
  trainerId?: string;
  createdAt?: string;
}

export function TrainingListContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTraining, setEditTraining] = useState<Training | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteTrainingId, setDeleteTrainingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    branch: '',
    trainerOption: 'Internal',
    trainingTypeId: '',
    employeeId: '',
    trainerId: '',
    startDate: '',
    endDate: '',
    cost: '',
    description: '',
  });
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [trainingTypes, setTrainingTypes] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [trainers, setTrainers] = useState<{ id: string; fullName: string }[]>([]);

  const trainerOptions = ['Internal', 'External'];

  const fetchTrainings = useCallback(async () => {
    try {
      const res = await fetch('/api/hrm/training/trainings');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTrainings(json.data);
      } else {
        toast.error(json.message ?? 'Gagal memuat training');
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat training');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  useEffect(() => {
    (async () => {
      try {
        const [bRes, tRes, eRes, trRes] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/training-types'),
          fetch('/api/hrm/assets/employees'),
          fetch('/api/hrm/training/trainers'),
        ]);
        const [bJson, tJson, eJson, trJson] = await Promise.all([
          bRes.json(),
          tRes.json(),
          eRes.json(),
          trRes.json(),
        ]);
        if (bJson.success && Array.isArray(bJson.data)) setBranches(bJson.data);
        if (tJson.success && Array.isArray(tJson.data)) setTrainingTypes(tJson.data);
        if (eJson.success && Array.isArray(eJson.data))
          setEmployees(eJson.data.map((emp: any) => ({ id: emp.id, name: emp.name })));
        if (trJson.success && Array.isArray(trJson.data))
          setTrainers(
            trJson.data.map((tr: any) => ({
              id: tr.id,
              fullName: `${tr.firstName} ${tr.lastName}`.trim(),
            })),
          );
      } catch {
        // silently ignore, UI will just have empty dropdowns
      }
    })();
  }, []);

  const handleAdd = () => {
    setEditTraining(null);
    setEditingId(null);
    setFormData({
      branch: '',
      trainerOption: 'Internal',
      trainingTypeId: '',
      employeeId: '',
      trainerId: '',
      startDate: '',
      endDate: '',
      cost: '',
      description: '',
    });
    setEditDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idToUpdate = editTraining?.id ?? editingId;

    if (!formData.trainingTypeId || !formData.employeeId || !formData.trainerId) {
      toast.error('Training Type, Employee, dan Trainer wajib diisi');
      return;
    }

    const payload = {
      branch: formData.branch,
      trainerOption: formData.trainerOption,
      trainingTypeId: formData.trainingTypeId,
      employeeId: formData.employeeId,
      trainerId: formData.trainerId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      cost: parseFloat(formData.cost || '0'),
      description: formData.description || undefined,
    };

    setSubmitting(true);
    try {
      const url = idToUpdate
        ? `/api/hrm/training/trainings/${idToUpdate}`
        : '/api/hrm/training/trainings';
      const method = idToUpdate ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          json.message ?? (idToUpdate ? 'Training berhasil diperbarui' : 'Training berhasil dibuat'),
        );
        setEditDialogOpen(false);
        setEditTraining(null);
        setEditingId(null);
        setFormData({
          branch: '',
          trainerOption: 'Internal',
          trainingTypeId: '',
          employeeId: '',
          trainerId: '',
          startDate: '',
          endDate: '',
          cost: '',
          description: '',
        });
        fetchTrainings();
      } else {
        toast.error(json.message ?? 'Gagal menyimpan training');
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan training');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Training) => {
    setEditTraining(item);
    setFormData({
      branch: item.branch,
      trainerOption: item.trainerOption ?? 'Internal',
      trainingTypeId: item.trainingTypeId ?? '',
      employeeId: item.employeeId ?? '',
      trainerId: item.trainerId ?? '',
      startDate: item.startDate,
      endDate: item.endDate,
      cost: item.cost.toString(),
      description: item.description ?? '',
    });
    setEditDialogOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteTrainingId(id);
    setDeleteAlertOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/hrm/training/trainings/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? 'Training berhasil dihapus');
        setDeleteTrainingId(null);
        setDeleteAlertOpen(false);
        fetchTrainings();
      } else {
        toast.error(json.message ?? 'Gagal menghapus training');
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus training');
    } finally {
      setDeleting(false);
    }
  };

  const filteredData = trainings.filter(
    (training) =>
      training.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.trainingType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.trainer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Started':
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Terminated':
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading trainings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trainings</p>
                <p className="text-2xl font-bold">{trainings.length}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {trainings.filter((t) => t.status === 'Completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {trainings.filter((t) => t.status === 'In Progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold text-purple-600">
                  Rp {trainings.reduce((sum, t) => sum + t.cost, 0).toLocaleString()}
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
          Create Training
        </Button>
      </div>

      {/* Training List - reference: training/index */}
      <Card className={cardClass}>
        <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-medium">Manage Training</h3>
          <div className="relative w-full max-w-[280px] ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by employee, training type, trainer, or branch..."
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
                <TableHead className="px-4 py-3">Training Type</TableHead>
                <TableHead className="px-4 py-3">Status</TableHead>
                <TableHead className="px-4 py-3">Employee</TableHead>
                <TableHead className="px-4 py-3">Trainer</TableHead>
                <TableHead className="px-4 py-3">Training Duration</TableHead>
                <TableHead className="px-4 py-3">Cost</TableHead>
                <TableHead className="px-4 py-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground px-4 py-3">
                    No trainings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell className="px-4 py-3 font-medium">{training.branch}</TableCell>
                    <TableCell className="px-4 py-3">{training.trainingType}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge className={getStatusBadgeColor(training.status)} variant="outline">
                        {training.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">{training.employee}</TableCell>
                    <TableCell className="px-4 py-3">{training.trainer}</TableCell>
                    <TableCell className="px-4 py-3">
                      {training.startDate} to {training.endDate}
                    </TableCell>
                    <TableCell className="px-4 py-3">Rp {training.cost.toLocaleString()}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          title="View"
                          className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                          asChild
                        >
                          <Link href={`/hrm/training/${training.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(training)}
                          title="Edit"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteConfirm(training.id)}
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

      {/* Edit dialog - ringkas, tanpa space kosong */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditTraining(null);
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-5">
          <DialogHeader className="pb-2 space-y-0.5">
            <DialogTitle className="text-base font-semibold">
              {editTraining ? 'Edit Training' : 'Create Training'}
            </DialogTitle>
            {editTraining ? (
              <DialogDescription className="text-xs text-muted-foreground">
                {editTraining.trainingType} — {editTraining.employee}
              </DialogDescription>
            ) : null}
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Branch <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.branch}
                  onValueChange={(v) => setFormData((f) => ({ ...f, branch: v }))}
                  required
                >
                  <SelectTrigger className="h-9">
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
                <p className="text-[11px] text-muted-foreground">
                  Belum ada?{' '}
                  <Link href="/hrm/setup/branch" className="text-primary hover:underline">
                    Buat branch
                  </Link>
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Employee <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(v) => setFormData((f) => ({ ...f, employeeId: v }))}
                  required
                >
                  <SelectTrigger className="h-9">
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
                <p className="text-[11px] text-muted-foreground">
                  Belum ada?{' '}
                  <Link href="/hrm/employees" className="text-primary hover:underline">
                    Buat employee
                  </Link>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Trainer Option <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.trainerOption}
                  onValueChange={(v) => setFormData((f) => ({ ...f, trainerOption: v }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {trainerOptions.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Training Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.trainingTypeId}
                  onValueChange={(v) => setFormData((f) => ({ ...f, trainingTypeId: v }))}
                  required
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainingTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Belum ada?{' '}
                  <Link href="/hrm/setup/training-type" className="text-primary hover:underline">
                    Buat tipe
                  </Link>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Trainer <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.trainerId}
                  onValueChange={(v) => setFormData((f) => ({ ...f, trainerId: v }))}
                  required
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select trainer" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Belum ada?{' '}
                  <Link href="/hrm/training?tab=trainer" className="text-primary hover:underline">
                    Buat trainer
                  </Link>
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Training Cost <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={formData.cost}
                  onChange={(e) => setFormData((f) => ({ ...f, cost: e.target.value }))}
                  required
                  className="h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData((f) => ({ ...f, startDate: e.target.value }))}
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData((f) => ({ ...f, endDate: e.target.value }))}
                  required
                  className="h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm">Description</Label>
              <Textarea
                placeholder="Description (opsional)"
                value={formData.description}
                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="resize-none min-h-[60px] text-sm"
              />
            </div>
            <DialogFooter className="gap-2 pt-3 mt-1 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDialogOpen(false)}
                  className="h-8"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-600 text-white hover:bg-blue-700 shadow-none h-8"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editTraining ? 'Update' : 'Create'}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation - reference-erp */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={(open) => { setDeleteAlertOpen(open); if (!open) setDeleteTrainingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus training?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin melanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2">
            <AlertDialogCancel type="button">Batal</AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={() => deleteTrainingId && handleDelete(deleteTrainingId)}
              disabled={deleting}
            >
              <span>{deleting ? 'Menghapus...' : 'Hapus'}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
