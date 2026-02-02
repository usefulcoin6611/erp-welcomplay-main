'use client';

import { useState } from 'react';
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
import { Search, Plus, Pencil, Trash2, Users } from 'lucide-react';

interface Department {
  id: number;
  branch: string;
  name: string;
}

export default function DepartmentTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ branch: '', name: '' });

  const [departments, setDepartments] = useState<Department[]>([
    { id: 1, branch: 'Head Office', name: 'Human Resources' },
    { id: 2, branch: 'Head Office', name: 'Finance & Accounting' },
    { id: 3, branch: 'Head Office', name: 'Information Technology' },
    { id: 4, branch: 'Jakarta Branch', name: 'Sales & Marketing' },
    { id: 5, branch: 'Jakarta Branch', name: 'Customer Service' },
    { id: 6, branch: 'Surabaya Branch', name: 'Operations' },
    { id: 7, branch: 'Bandung Branch', name: 'Research & Development' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      setDepartments(
        departments.map((d) =>
          d.id === editingId ? { ...d, branch: formData.branch, name: formData.name } : d
        )
      );
      setEditingId(null);
    } else {
      const newDepartment: Department = {
        id: Math.max(0, ...departments.map((d) => d.id)) + 1,
        branch: formData.branch,
        name: formData.name,
      };
      setDepartments([...departments, newDepartment]);
    }
    setShowForm(false);
    setFormData({ branch: '', name: '' });
  };

  const handleEdit = (department: Department) => {
    setFormData({ branch: department.branch, name: department.name });
    setEditingId(department.id);
    setShowForm(true);
  };

  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  const openDeleteConfirm = (department: Department) => {
    setDepartmentToDelete(department);
    setDeleteAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    if (departmentToDelete) {
      setDepartments(departments.filter((d) => d.id !== departmentToDelete.id));
      setDepartmentToDelete(null);
    }
    setDeleteAlertOpen(false);
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all branches</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Departments</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200 h-8"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-muted/50 p-4 md:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    placeholder="e.g., Head Office"
                    required
                  />
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
                  className="shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                >
                  {editingId !== null ? 'Update' : 'Create'} Department
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ branch: '', name: '' });
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
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <Badge variant="secondary" className="whitespace-nowrap">{department.branch}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{department.name}</TableCell>
                    <TableCell className="text-right">
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
                ))}
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
