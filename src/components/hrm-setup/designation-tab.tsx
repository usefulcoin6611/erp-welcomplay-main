'use client';

import { useState, useEffect, useCallback } from 'react';
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
} from "@/components/ui/select";
import { Search, Plus, Pencil, Trash2, Briefcase, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Designation {
  id: string;
  name: string;
  departmentId: string;
  department: {
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
}

export default function DesignationTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ departmentId: '', name: '' });
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDesignations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/designations');
      const result = await response.json();
      if (result.success) {
        setDesignations(result.data);
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

  useEffect(() => {
    fetchDesignations();
    fetchDepartments();
  }, [fetchDesignations, fetchDepartments]);

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
        setShowForm(false);
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
    setEditingId(designation.id);
    setShowForm(true);
  };

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [designationToDelete, setDesignationToDelete] = useState<Designation | null>(null);

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
      desig.department.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Designations</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                designations.length
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Job positions defined</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Designations</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) {
              setEditingId(null);
              setFormData({ departmentId: '', name: '' });
            }
          }}
          size="sm"
          className="shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200 h-8"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Designation
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-muted/50 p-4 md:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
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
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingId !== null ? 'Update' : 'Create'} Designation
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ departmentId: '', name: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search designations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                  filteredDesignations.map((designation) => (
                    <TableRow key={designation.id}>
                      <TableCell>
                        <Badge variant="secondary" className="whitespace-nowrap bg-green-50 text-green-700">
                          {designation.department.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{designation.name}</TableCell>
                      <TableCell className="text-right">
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
