'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, Pencil, Trash2, Building2 } from 'lucide-react';

interface Branch {
  id: number;
  name: string;
}

export default function BranchTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const [branches, setBranches] = useState<Branch[]>([
    { id: 1, name: 'Head Office' },
    { id: 2, name: 'Jakarta Branch' },
    { id: 3, name: 'Surabaya Branch' },
    { id: 4, name: 'Bandung Branch' },
    { id: 5, name: 'Bali Branch' },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      setBranches(branches.map((b) => (b.id === editingId ? { ...b, name: formData.name } : b)));
      setEditingId(null);
    } else {
      const newBranch: Branch = {
        id: Math.max(0, ...branches.map((b) => b.id)) + 1,
        name: formData.name,
      };
      setBranches([...branches, newBranch]);
    }
    setShowForm(false);
    setFormData({ name: '' });
  };

  const handleEdit = (branch: Branch) => {
    setFormData({ name: branch.name });
    setEditingId(branch.id);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      setBranches(branches.filter((b) => b.id !== id));
    }
  };

  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{branches.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active locations</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Branches</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-muted/50 p-4 md:p-6">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="e.g., Jakarta Branch"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                  {editingId !== null ? 'Update' : 'Create'} Branch
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '' });
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
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(branch)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(branch.id)}
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
