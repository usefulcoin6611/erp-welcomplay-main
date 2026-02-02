'use client';

import { useState } from 'react';
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
import {
  getOnboardingsList,
  addOnboarding,
  updateOnboarding,
  removeOnboardingById,
  type OnboardingDetail,
} from '@/lib/recruitment-data';
import { toast } from 'sonner';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)]';

function formatDate(value: string | undefined): string {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('id-ID', {
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
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteOnboardingId, setDeleteOnboardingId] = useState<string | null>(null);
  const [onboardings, setOnboardings] = useState(() => getOnboardingsList());

  const [formData, setFormData] = useState({
    employeeName: '',
    position: '',
    department: '',
    joinDate: '',
    status: '',
    branch: '',
    appliedAt: '',
  });

  const refreshOnboardings = () => setOnboardings([...getOnboardingsList()]);

  const departments = ['IT', 'Marketing', 'Finance', 'HR', 'Operations'];
  const statuses = ['Pending', 'In Progress', 'Completed'];
  const branches = ['Head Office', 'Branch A', 'Branch B'];

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      employeeName: '',
      position: '',
      department: '',
      joinDate: '',
      status: 'Pending',
      branch: '',
      appliedAt: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateOnboarding(editingId, {
        employeeName: formData.employeeName,
        position: formData.position,
        department: formData.department,
        joinDate: formData.joinDate,
        status: formData.status,
        branch: formData.branch || undefined,
        appliedAt: formData.appliedAt || undefined,
      });
      toast.success('Onboarding berhasil diupdate');
    } else {
      addOnboarding({
        employeeName: formData.employeeName,
        position: formData.position,
        department: formData.department,
        joinDate: formData.joinDate,
        status: formData.status,
        progress: 0,
        branch: formData.branch || undefined,
        appliedAt: formData.appliedAt || undefined,
        convertToEmployeeId: null,
      });
      toast.success('Onboarding berhasil dibuat');
    }
    setShowForm(false);
    refreshOnboardings();
  };

  const handleEdit = (item: OnboardingDetail) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      employeeName: item.employeeName,
      position: item.position,
      department: item.department,
      joinDate: item.joinDate,
      status: item.status,
      branch: item.branch ?? '',
      appliedAt: item.appliedAt ?? '',
    });
  };

  const openDeleteConfirm = (id: string) => {
    setDeleteOnboardingId(id);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteOnboardingId) {
      removeOnboardingById(deleteOnboardingId);
      refreshOnboardings();
      setDeleteOnboardingId(null);
    }
    setDeleteAlertOpen(false);
    toast.success('Onboarding dihapus');
  };

  const handleConvertToEmployee = (item: OnboardingDetail) => {
    const employeeId = `emp-${item.id}`;
    updateOnboarding(item.id, { convertToEmployeeId: employeeId });
    refreshOnboardings();
    toast.success(`${item.employeeName} berhasil dikonversi ke karyawan`);
  };

  const handleViewEmployee = (employeeId: string) => {
    router.push(`/hrm/employees/${employeeId}`);
  };

  const handleDownloadOfferLetter = (format: 'pdf' | 'doc', item: OnboardingDetail) => {
    toast.success(`Download Offer Letter ${format.toUpperCase()}: ${item.employeeName}`);
  };

  const filteredData = onboardings.filter(
    (o) =>
      o.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.department && o.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.branch && o.branch.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isConfirm = (status: string) => status === 'Completed';
  const canConvert = (o: OnboardingDetail) =>
    isConfirm(o.status) && (o.convertToEmployeeId == null || o.convertToEmployeeId === '');
  const hasConverted = (o: OnboardingDetail) =>
    isConfirm(o.status) && o.convertToEmployeeId != null && o.convertToEmployeeId !== '';

  return (
    <div className="space-y-4">
      {/* Summary Cards - sesuai acuan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                {onboardings.filter((o) => o.status === 'In Progress').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {onboardings.filter((o) => o.status === 'Completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-600">
                {onboardings.filter((o) => o.status === 'Pending').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card: Title + Create Button - sesuai reference-erp action-btn */}
      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-6">
          <CardTitle className="text-base font-semibold">Manage Job On-boarding</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-full min-w-[200px] max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, job, department..."
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
              onClick={handleAdd}
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
                  <TableHead className="px-6 font-medium">Branch</TableHead>
                  <TableHead className="px-6 font-medium">Applied at</TableHead>
                  <TableHead className="px-6 font-medium">Joining at</TableHead>
                  <TableHead className="px-6 font-medium">Status</TableHead>
                  <TableHead className="px-6 font-medium text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No onboarding records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((o) => (
                    <TableRow key={o.id} className="border-b">
                      <TableCell className="px-6 font-medium">{o.employeeName}</TableCell>
                      <TableCell className="px-6">{o.position}</TableCell>
                      <TableCell className="px-6">{o.branch ?? '-'}</TableCell>
                      <TableCell className="px-6">{formatDate(o.appliedAt)}</TableCell>
                      <TableCell className="px-6">{formatDate(o.joinDate)}</TableCell>
                      <TableCell className="px-6">
                        <Badge className={getStatusBadgeColor(o.status)} variant="outline">
                          {o.status}
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
                          {hasConverted(o) && o.convertToEmployeeId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 shadow-none bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                              onClick={() => handleViewEmployee(o.convertToEmployeeId!)}
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
                          {isConfirm(o.status) && (
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

      {/* Add/Edit Form - modal sesuai reference-erp (data-ajax-popup) */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) setEditingId(null);
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Job OnBoard' : 'Create New Job OnBoard'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-employeeName">Employee Name</Label>
                <Input
                  id="modal-employeeName"
                  value={formData.employeeName}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeName: e.target.value })
                  }
                  className="h-9"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-position">Job</Label>
                <Input
                  id="modal-position"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  className="h-9"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-branch">Branch</Label>
                <Select
                  value={formData.branch || 'all'}
                  onValueChange={(v) =>
                    setFormData({ ...formData, branch: v === 'all' ? '' : v })
                  }
                >
                  <SelectTrigger id="modal-branch" className="h-9">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">-</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-appliedAt">Applied at</Label>
                <Input
                  id="modal-appliedAt"
                  type="date"
                  value={formData.appliedAt}
                  onChange={(e) =>
                    setFormData({ ...formData, appliedAt: e.target.value })
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-joinDate">Joining at</Label>
                <Input
                  id="modal-joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) =>
                    setFormData({ ...formData, joinDate: e.target.value })
                  }
                  className="h-9"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(v) => setFormData({ ...formData, department: v })}
                >
                  <SelectTrigger id="modal-department" className="h-9">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger id="modal-status" className="h-9">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 bg-blue-600 text-white hover:bg-blue-700 shadow-none"
              >
                {editingId ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
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
            <AlertDialogAction type="button" onClick={handleDeleteConfirm}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
