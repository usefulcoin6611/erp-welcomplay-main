'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, UserCheck } from 'lucide-react';

interface Onboarding {
  id: string;
  employeeName: string;
  position: string;
  department: string;
  joinDate: string;
  status: string;
  progress: number;
}

export function OnboardingContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employeeName: '',
    position: '',
    department: '',
    joinDate: '',
    status: '',
  });

  // Mock data
  const [onboardings, setOnboardings] = useState<Onboarding[]>([
    {
      id: '1',
      employeeName: 'John Smith',
      position: 'Senior Software Engineer',
      department: 'IT',
      joinDate: '2024-03-01',
      status: 'In Progress',
      progress: 60,
    },
    {
      id: '2',
      employeeName: 'Sarah Johnson',
      position: 'Marketing Manager',
      department: 'Marketing',
      joinDate: '2024-02-15',
      status: 'Completed',
      progress: 100,
    },
    {
      id: '3',
      employeeName: 'Mike Brown',
      position: 'Accountant',
      department: 'Finance',
      joinDate: '2024-03-10',
      status: 'Pending',
      progress: 20,
    },
  ]);

  const departments = ['IT', 'Marketing', 'Finance', 'HR', 'Operations'];
  const statuses = ['Pending', 'In Progress', 'Completed'];

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      employeeName: '',
      position: '',
      department: '',
      joinDate: '',
      status: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setOnboardings(
        onboardings.map((item) =>
          item.id === editingId
            ? {
                ...item,
                employeeName: formData.employeeName,
                position: formData.position,
                department: formData.department,
                joinDate: formData.joinDate,
                status: formData.status,
              }
            : item
        )
      );
    } else {
      const newItem: Onboarding = {
        id: Date.now().toString(),
        employeeName: formData.employeeName,
        position: formData.position,
        department: formData.department,
        joinDate: formData.joinDate,
        status: formData.status,
        progress: 0,
      };
      setOnboardings([...onboardings, newItem]);
    }
    setShowForm(false);
  };

  const handleEdit = (item: Onboarding) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      employeeName: item.employeeName,
      position: item.position,
      department: item.department,
      joinDate: item.joinDate,
      status: item.status,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this onboarding?')) {
      setOnboardings(onboardings.filter((item) => item.id !== id));
    }
  };

  const filteredData = onboardings.filter(
    (onboarding) =>
      onboarding.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      onboarding.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      onboarding.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Onboarding</p>
                <p className="text-2xl font-bold">{onboardings.length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {onboardings.filter((o) => o.status === 'In Progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {onboardings.filter((o) => o.status === 'Completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {onboardings.filter((o) => o.status === 'Pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end items-center">
        <Button onClick={handleAdd} className="bg-blue-500 hover:bg-blue-600 shadow-none">
          <Plus className="w-4 h-4 mr-2" />
          Create Onboarding
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create New'} Onboarding</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeName">Employee Name</Label>
                  <Input
                    id="employeeName"
                    value={formData.employeeName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, employeeName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Input
                    id="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, joinDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none">
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Onboarding List */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by employee name, position, or department..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No onboarding records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((onboarding) => (
                  <TableRow key={onboarding.id}>
                    <TableCell className="font-medium">{onboarding.employeeName}</TableCell>
                    <TableCell>{onboarding.position}</TableCell>
                    <TableCell>{onboarding.department}</TableCell>
                    <TableCell>{onboarding.joinDate}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(onboarding.status)}>{onboarding.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${onboarding.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{onboarding.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(onboarding)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(onboarding.id)}
                          title="Delete"
                          className="text-red-600 hover:text-red-700"
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
    </div>
  );
}
