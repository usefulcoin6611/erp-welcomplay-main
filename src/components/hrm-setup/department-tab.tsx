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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus, Pencil, Trash2, Users, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

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

export type DepartmentTabRef = { openCreate: () => void };

interface DepartmentTabProps {
  onCountChange?: (count: number) => void;
}

function DepartmentTabInner(
  { onCountChange }: DepartmentTabProps,
  ref: React.Ref<DepartmentTabRef>
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ branchId: '', name: '' });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/departments');
      const result = await response.json();
      if (result.success) {
        setDepartments(result.data);
        if (onCountChange) {
          onCountChange(result.data.length);
        }
      } else {
        toast.error(result.message || 'Gagal memuat data department');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
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
    fetchDepartments();
    fetchBranches();
  }, [fetchDepartments, fetchBranches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.branchId || !formData.name) {
      toast.error('Branch dan Nama Department harus diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/departments/${editingId}` : '/api/departments';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingId ? 'Department diperbarui' : 'Department dibuat');
        fetchDepartments();
        setShowForm(false);
        setEditingId(null);
        setFormData({ branchId: '', name: '' });
      } else {
        toast.error(result.message || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (department: Department) => {
    setFormData({ branchId: department.branchId, name: department.name });
    setEditingId(department.id);
    setShowForm(true);
  };

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useImperativeHandle(
    ref,
    () => ({
      openCreate: () => {
        setShowForm(true);
        setEditingId(null);
        setFormData({ branchId: '', name: '' });
      },
    }),
    []
  );

  const openDeleteConfirm = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      const response = await fetch(`/api/departments/${departmentToDelete.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Department berhasil dihapus');
        fetchDepartments();
      } else {
        toast.error(result.message || 'Gagal menghapus department');
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Terjadi kesalahan sistem');
    } finally {
      setDeleteAlertOpen(false);
      setDepartmentToDelete(null);
    }
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedDepartments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDepartments.slice(start, start + pageSize);
  }, [filteredDepartments, currentPage, pageSize]);

  const displayDepartments = paginatedDepartments;

  return (
    <div className="space-y-4">
      <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white rounded-lg">
        <CardContent className="space-y-4 px-2 pb-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200/80 pb-3 px-2">
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
                placeholder="Search departments..."
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
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-muted/50 p-4 md:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select
                    value={formData.branchId}
                    onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Human Resources"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="shadow-none bg-blue-500 text-white hover:bg-blue-600"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId !== null ? 'Update' : 'Create'} Department
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ branchId: '', name: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

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
                ) : filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  displayDepartments.map((department) => (
                    <TableRow key={department.id}>
                      <TableCell className="px-4 py-3">
                        <Badge variant="secondary" className="whitespace-nowrap">
                          {department.branch.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">{department.name}</TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(department)}
                            className="shadow-none h-7 w-7 p-0 bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteConfirm(department)}
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

      <AlertDialog open={deleteAlertOpen} onOpenChange={(open) => { setDeleteAlertOpen(open); if (!open) setDepartmentToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Department?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{departmentToDelete?.name}&quot; akan dihapus. Tindakan ini tidak dapat dibatalkan.
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

const DepartmentTab = forwardRef(DepartmentTabInner) as (
  props: DepartmentTabProps & { ref?: React.Ref<DepartmentTabRef> }
) => React.ReactElement;

export default DepartmentTab;
