'use client';

import { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Pencil, Trash2, Briefcase, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Designation {
  id: string;
  name: string;
  departmentId: string;
  department: {
    name: string;
    branch?: {
      id: string;
      name: string;
    } | null;
  };
}

interface Department {
  id: string;
  name: string;
  branchId: string;
  branch: {
    name: string;
  };
}

interface Branch {
  id: string;
  name: string;
}

export type DesignationTabRef = { openCreate: () => void };

interface DesignationTabProps {
  onCountChange?: (count: number) => void;
}

function DesignationTabInner(
  { onCountChange }: DesignationTabProps,
  ref: React.Ref<DesignationTabRef>
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ departmentId: '', name: '' });
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDesignations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/designations');
      const result = await response.json();
      if (result.success) {
        setDesignations(result.data);
        if (onCountChange) {
          onCountChange(result.data.length);
        }
      } else {
        toast.error(result.message || 'Gagal memuat data designation');
      }
    } catch (error) {
      console.error('Error fetching designations:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await fetch('/api/departments');
      const result = await response.json();
      if (result.success) {
        setDepartments(result.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }, []);

  const fetchBranches = useCallback(async () => {
    try {
      const response = await fetch('/api/branches');
      const result = await response.json();
      if (result.success) {
        setBranches(result.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  }, []);

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
    fetchBranches();
  }, [fetchDesignations, fetchDepartments, fetchBranches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.departmentId || !formData.name) {
      toast.error('Department dan Nama Designation harus diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/designations/${editingId}` : '/api/designations';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingId ? 'Designation diperbarui' : 'Designation dibuat');
        fetchDesignations();
        setDialogOpen(false);
        setEditingId(null);
        setFormData({ departmentId: '', name: '' });
      } else {
        toast.error(result.message || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error saving designation:', error);
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (designation: Designation) => {
    setFormData({
      departmentId: designation.departmentId,
      name: designation.name,
    });
    const dept = departments.find((d) => d.id === designation.departmentId);
    setSelectedBranchId(dept?.branchId ?? '');
    setEditingId(designation.id);
    setDialogOpen(true);
  };

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [designationToDelete, setDesignationToDelete] = useState<Designation | null>(null);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useImperativeHandle(
    ref,
    () => ({
      openCreate: () => {
        setDialogOpen(true);
        setEditingId(null);
        setFormData({ departmentId: '', name: '' });
        setSelectedBranchId('');
      },
    }),
    []
  );

  const openDeleteConfirm = (designation: Designation) => {
    setDesignationToDelete(designation);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!designationToDelete) return;

    try {
      const response = await fetch(`/api/designations/${designationToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Designation berhasil dihapus');
        fetchDesignations();
      } else {
        toast.error(result.message || 'Gagal menghapus designation');
      }
    } catch (error) {
      console.error('Error deleting designation:', error);
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setDeleteAlertOpen(false);
      setDesignationToDelete(null);
    }
  };

  const filteredDesignations = designations.filter(
    (desig) =>
      desig.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desig.department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (desig.department.branch?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDepartmentsForSelect = useMemo(
    () =>
      selectedBranchId
        ? departments.filter((dept) => dept.branchId === selectedBranchId)
        : departments,
    [departments, selectedBranchId]
  );

  const paginatedDesignations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDesignations.slice(start, start + pageSize);
  }, [filteredDesignations, currentPage, pageSize]);

  const displayDesignations = paginatedDesignations;

  return (
    <div className="space-y-4">
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white rounded-lg">
        <CardContent className="space-y-4 px-2 pb-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-9 w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>entries per page</span>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search designations..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 pl-9 pr-9 bg-gray-50 hover:bg-gray-100 focus-visible:ring-0 border-0 focus-visible:border-0 shadow-none transition-colors"
              />
              {searchTerm.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => {
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground">
                    Branch
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground">
                    Department
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide text-muted-foreground">
                    Designation
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-semibold tracking-wide text-right text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Memuat data...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredDesignations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  displayDesignations.map((designation) => (
                    <TableRow key={designation.id}>
                      <TableCell className="px-4 py-3">
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {designation.department.branch?.name ?? '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {designation.department.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">{designation.name}</TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(designation)}
                            className="shadow-none h-7 w-7 p-0 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteConfirm(designation)}
                            className="shadow-none h-7 w-7 p-0 bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingId(null);
            setFormData({ departmentId: '', name: '' });
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editingId !== null ? 'Edit Designation' : 'Create New Designation'}
            </DialogTitle>
            <DialogDescription>
              {editingId !== null
                ? 'Perbarui informasi designation.'
                : 'Tambahkan designation baru.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={selectedBranchId}
                  onValueChange={(value) => {
                    setSelectedBranchId(value);
                    setFormData({ ...formData, departmentId: '' });
                  }}
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Pilih Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.departmentId}
                  onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  disabled={!selectedBranchId}
                >
                  <SelectTrigger className="h-9 bg-white">
                    <SelectValue placeholder="Pilih Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDepartmentsForSelect.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Designation Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., HR Manager"
                  required
                  className="h-9 bg-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="shadow-none bg-blue-500 text-white hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId !== null ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteAlertOpen} onOpenChange={(open) => { setDeleteAlertOpen(open); if (!open) setDesignationToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Designation?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{designationToDelete?.name}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

const DesignationTab = forwardRef(DesignationTabInner) as (
  props: DesignationTabProps & { ref?: React.Ref<DesignationTabRef> }
) => React.ReactElement;

export default DesignationTab;
