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
import { Search, Plus, Pencil, Trash2, Briefcase } from 'lucide-react';

interface Designation {
  id: number;
  branch: string;
  department: string;
  name: string;
}

export default function DesignationTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ branch: '', department: '', name: '' });

  const [designations, setDesignations] = useState<Designation[]>([
    { id: 1, branch: 'Head Office', department: 'Human Resources', name: 'HR Manager' },
    { id: 2, branch: 'Head Office', department: 'Human Resources', name: 'HR Specialist' },
    { id: 3, branch: 'Head Office', department: 'Finance & Accounting', name: 'Finance Director' },
    { id: 4, branch: 'Head Office', department: 'Finance & Accounting', name: 'Senior Accountant' },
    { id: 5, branch: 'Head Office', department: 'Information Technology', name: 'IT Manager' },
    { id: 6, branch: 'Head Office', department: 'Information Technology', name: 'Software Engineer' },
    { id: 7, branch: 'Jakarta Branch', department: 'Sales & Marketing', name: 'Sales Manager' },
    { id: 8, branch: 'Jakarta Branch', department: 'Sales & Marketing', name: 'Marketing Executive' },
    { id: 9, branch: 'Jakarta Branch', department: 'Customer Service', name: 'CS Supervisor' },
    { id: 10, branch: 'Surabaya Branch', department: 'Operations', name: 'Operations Manager' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      setDesignations(
        designations.map((d) =>
          d.id === editingId
            ? { ...d, branch: formData.branch, department: formData.department, name: formData.name }
            : d
        )
      );
      setEditingId(null);
    } else {
      const newDesignation: Designation = {
        id: Math.max(0, ...designations.map((d) => d.id)) + 1,
        branch: formData.branch,
        department: formData.department,
        name: formData.name,
      };
      setDesignations([...designations, newDesignation]);
    }
    setShowForm(false);
    setFormData({ branch: '', department: '', name: '' });
  };

  const handleEdit = (designation: Designation) => {
    setFormData({
      branch: designation.branch,
      department: designation.department,
      name: designation.name,
    });
    setEditingId(designation.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this designation?')) {
      setDesignations(designations.filter((d) => d.id !== id));
    }
  };

  const filteredDesignations = designations.filter(
    (desig) =>
      desig.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desig.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desig.department.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="text-2xl font-bold">{designations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Job positions defined</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Designations</CardTitle>
            <Button onClick={() => setShowForm(!showForm)} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="mr-2 h-4 w-4" />
              Add Designation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-muted/50 p-4 md:p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Human Resources"
                    required
                  />
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
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                  {editingId !== null ? 'Update' : 'Create'} Designation
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ branch: '', department: '', name: '' });
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
                  <TableHead>Branch</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDesignations.map((designation) => (
                  <TableRow key={designation.id}>
                    <TableCell>
                      <Badge variant="secondary" className="whitespace-nowrap bg-blue-50 text-blue-700">
                        {designation.branch}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="whitespace-nowrap bg-green-50 text-green-700">
                        {designation.department}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{designation.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(designation)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(designation.id)}
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
