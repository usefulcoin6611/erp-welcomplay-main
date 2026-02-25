'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  UserCheck,
  Eye,
  Download,
  FileText,
  X,
  UserPlus,
  Loader2,
} from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'converted', label: 'Converted' },
] as const;

type OnboardingItem = {
  id: string;
  applicationId: string;
  application: {
    id: string;
    applicantName: string;
    email: string;
    jobId: string;
    jobTitle: string;
    stage: string;
  };
  employeeId?: string;
  employee?: { id: string; name: string; employeeId: string };
  status: string;
  onboardingDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

type ApplicationOption = { id: string; applicantName: string; jobTitle: string; stage: string };
type EmployeeOption = { id: string; name: string; employeeId: string };
type StageOption = { id: string; name: string };

function formatDate(value: string | undefined): string {
  if (!value) return '-';
  try {
    return new Date(value + 'T00:00:00').toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

export function OnboardingContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [onboardings, setOnboardings] = useState<OnboardingItem[]>([]);
  const [stages, setStages] = useState<StageOption[]>([]);
  const [hiredApplications, setHiredApplications] = useState<ApplicationOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<OnboardingItem | null>(null);
  const [createApplicationId, setCreateApplicationId] = useState('');
  const [editForm, setEditForm] = useState({
    status: 'pending',
    onboardingDate: '',
    completedAt: '',
    employeeId: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteOnboardingId, setDeleteOnboardingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOnboardings = useCallback(async () => {
    try {
      const res = await fetch('/api/hrm/recruitment/onboarding');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOnboardings(json.data);
      } else {
        toast.error(json.message ?? 'Gagal memuat data onboarding');
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memuat data onboarding');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnboardings();
  }, [fetchOnboardings]);

  useEffect(() => {
    (async () => {
      try {
        const [stagesRes, employeesRes] = await Promise.all([
          fetch('/api/job-stages'),
          fetch('/api/hrm/assets/employees'),
        ]);
        const stagesJson = await stagesRes.json();
        const employeesJson = await employeesRes.json();
        if (stagesJson.success && Array.isArray(stagesJson.data)) {
          setStages(stagesJson.data.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })));
        }
        if (employeesJson.success && Array.isArray(employeesJson.data)) {
          setEmployees(
            employeesJson.data.map((e: { id: string; name: string; employeeId: string }) => ({
              id: e.id,
              name: e.name,
              employeeId: e.employeeId ?? e.id,
            }))
          );
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const loadHiredApplications = useCallback(async () => {
    const stagesRes = await fetch('/api/job-stages');
    const stagesJson = await stagesRes.json();
    if (!stagesJson.success || !Array.isArray(stagesJson.data)) return;
    const hiredStage = (stagesJson.data as StageOption[]).find((s) => s.name === 'Hired');
    if (!hiredStage) {
      toast.error('Stage "Hired" tidak ditemukan. Tambah di Setup → Job Stage.');
      return;
    }
    const appRes = await fetch(`/api/hrm/recruitment/applications?stageId=${hiredStage.id}`);
    const appJson = await appRes.json();
    if (!appJson.success || !Array.isArray(appJson.data)) return;
    const hired = (appJson.data as { id: string; applicantName: string; jobTitle: string; stage: string }[]).map(
      (a) => ({ id: a.id, applicantName: a.applicantName, jobTitle: a.jobTitle, stage: a.stage })
    );
    const existingAppIds = new Set(onboardings.map((o) => o.applicationId));
    setHiredApplications(hired.filter((a) => !existingAppIds.has(a.id)));
  }, [onboardings]);

  const handleOpenCreate = () => {
    setCreateApplicationId('');
    loadHiredApplications();
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createApplicationId) {
      toast.error('Pilih lamaran (Hired) terlebih dahulu');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/hrm/recruitment/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: createApplicationId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? 'Onboarding berhasil dibuat');
        setShowCreateModal(false);
        fetchOnboardings();
      } else {
        toast.error(json.message ?? 'Gagal membuat onboarding');
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal membuat onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: OnboardingItem) => {
    setEditingItem(item);
    setEditForm({
      status: item.status,
      onboardingDate: item.onboardingDate ?? '',
      completedAt: item.completedAt ?? '',
      employeeId: item.employeeId ?? '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/hrm/recruitment/onboarding/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editForm.status,
          onboardingDate: editForm.onboardingDate || null,
          completedAt: editForm.completedAt || null,
          employeeId: editForm.employeeId || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? 'Onboarding berhasil diperbarui');
        setShowEditModal(false);
        setEditingItem(null);
        fetchOnboardings();
      } else {
        toast.error(json.message ?? 'Gagal memperbarui onboarding');
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal memperbarui onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteOnboardingId(id);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteOnboardingId) {
      setDeleteAlertOpen(false);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/hrm/recruitment/onboarding/${deleteOnboardingId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message ?? 'Onboarding berhasil dihapus');
        fetchOnboardings();
        setDeleteOnboardingId(null);
        setDeleteAlertOpen(false);
      } else {
        toast.error(json.message ?? 'Gagal menghapus onboarding');
      }
    } catch (e) {
      console.error(e);
      toast.error('Gagal menghapus onboarding');
    } finally {
      setDeleting(false);
    }
  };

  const handleConvertToEmployee = (item: OnboardingItem) => {
    setEditingItem(item);
    setEditForm((prev) => ({ ...prev, status: 'converted', employeeId: prev.employeeId ?? '' }));
    setShowEditModal(true);
  };

  const handleViewEmployee = (item: OnboardingItem) => {
    if (!item.employee?.employeeId) return;
    router.push(`/hrm/employees/${item.employee.employeeId}`);
  };

  const handleDownloadOfferLetter = (_format: 'pdf' | 'doc', item: OnboardingItem) => {
    toast.info(`Unduh offer letter (${item.application.applicantName}) akan tersedia di versi berikutnya.`);
  };

  const filteredData = onboardings.filter(
    (o) =>
      o.application.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.application.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.application.email && o.application.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'converted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const o = STATUS_OPTIONS.find((s) => s.value === status);
    return o?.label ?? status;
  };

  const canConvert = (o: OnboardingItem) =>
    (o.status === 'completed' || o.status === 'in_progress') && !o.employeeId;
  const hasConverted = (o: OnboardingItem) => o.employeeId && o.employee;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Onboarding</p>
                <p className="text-2xl font-bold">{onboardings.length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-amber-600">
                {onboardings.filter((o) => o.status === 'in_progress').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {onboardings.filter((o) => o.status === 'completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-600">
                {onboardings.filter((o) => o.status === 'pending').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Converted</p>
              <p className="text-2xl font-bold text-green-600">
                {onboardings.filter((o) => o.status === 'converted' || o.employeeId).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle className="text-base font-semibold">Manage Job On-boarding</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-full min-w-[200px] max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, job, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-9 border-0 bg-gray-50 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0"
              />
              {searchTerm.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              size="sm"
              className="h-9 shadow-none bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleOpenCreate}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/30">
                  <TableHead className="px-6 font-medium">Name</TableHead>
                  <TableHead className="px-6 font-medium">Job</TableHead>
                  <TableHead className="px-6 font-medium">Onboarding date</TableHead>
                  <TableHead className="px-6 font-medium">Completed at</TableHead>
                  <TableHead className="px-6 font-medium">Status</TableHead>
                  <TableHead className="px-6 font-medium text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      Tidak ada data onboarding. Buat dari lamaran yang sudah stage Hired.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((o) => (
                    <TableRow key={o.id} className="border-b">
                      <TableCell className="px-6 font-medium">{o.application.applicantName}</TableCell>
                      <TableCell className="px-6">{o.application.jobTitle}</TableCell>
                      <TableCell className="px-6">{formatDate(o.onboardingDate)}</TableCell>
                      <TableCell className="px-6">{formatDate(o.completedAt)}</TableCell>
                      <TableCell className="px-6">
                        <Badge className={getStatusBadgeColor(o.status)} variant="outline">
                          {getStatusLabel(o.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {canConvert(o) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 shadow-none bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                              onClick={() => handleConvertToEmployee(o)}
                              title="Convert to Employee"
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
                          {hasConverted(o) && o.employee && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 shadow-none bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                              onClick={() => handleViewEmployee(o)}
                              title="View Employee"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                            onClick={() => handleEdit(o)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 shadow-none bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                            onClick={() => openDeleteConfirm(o.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {(o.status === 'completed' || o.status === 'converted') && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 shadow-none bg-blue-600 text-white hover:bg-blue-700 border-0"
                                onClick={() => handleDownloadOfferLetter('pdf', o)}
                                title="Offer Letter PDF"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 shadow-none bg-blue-600 text-white hover:bg-blue-700 border-0"
                                onClick={() => handleDownloadOfferLetter('doc', o)}
                                title="Offer Letter DOC"
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create: pilih application Hired */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Buat Onboarding Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Lamaran (stage Hired)</Label>
              <Select value={createApplicationId} onValueChange={setCreateApplicationId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih lamaran yang sudah Hired" />
                </SelectTrigger>
                <SelectContent>
                  {hiredApplications.length === 0 ? (
                    <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                      Tidak ada lamaran Hired yang belum onboarding.
                    </div>
                  ) : (
                    hiredApplications.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.applicantName} – {a.jobTitle}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} disabled={submitting}>
                Batal
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting || hiredApplications.length === 0}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Buat'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit: status, dates, link employee */}
      <Dialog
        open={showEditModal}
        onOpenChange={(open) => {
          if (!submitting) {
            setShowEditModal(open);
            if (!open) setEditingItem(null);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Onboarding</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {editingItem.application.applicantName} – {editingItem.application.jobTitle}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Link ke Employee (convert)</Label>
                  <Select
                    value={editForm.employeeId || 'none'}
                    onValueChange={(v) => setEditForm((f) => ({ ...f, employeeId: v === 'none' ? '' : v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih karyawan (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Tidak link —</SelectItem>
                      {employees.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.name} ({e.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal onboarding</Label>
                  <Input
                    type="date"
                    value={editForm.onboardingDate}
                    onChange={(e) => setEditForm((f) => ({ ...f, onboardingDate: e.target.value }))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal selesai</Label>
                  <Input
                    type="date"
                    value={editForm.completedAt}
                    onChange={(e) => setEditForm((f) => ({ ...f, completedAt: e.target.value }))}
                    className="h-9"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} disabled={submitting}>
                  Batal
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Onboarding?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data onboarding akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2">
            <AlertDialogCancel type="button">Batal</AlertDialogCancel>
            <AlertDialogAction type="button" disabled={deleting} onClick={handleDeleteConfirm}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
