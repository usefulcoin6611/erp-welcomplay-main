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

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this department?')) {
      setDepartments(departments.filter((d) => d.id !== id));
    }
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
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-500 hover:bg-blue-600">
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
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
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
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(department)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(department.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
