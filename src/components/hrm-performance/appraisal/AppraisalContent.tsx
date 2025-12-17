'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Star, Eye } from 'lucide-react';

interface Appraisal {
  id: string;
  branch: string;
  department: string;
  designation: string;
  employee: string;
  targetRating: number;
  overallRating: number;
  appraisalDate: string;
}

export function AppraisalContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    branch: '',
    employee: '',
    appraisalDate: '',
    technicalRating: '',
    leadershipRating: '',
    teamworkRating: '',
    communicationRating: '',
    remarks: '',
  });

  // Mock data
  const [appraisals, setAppraisals] = useState<Appraisal[]>([
    {
      id: '1',
      branch: 'Head Office',
      department: 'IT',
      designation: 'Senior Developer',
      employee: 'John Doe',
      targetRating: 4.0,
      overallRating: 4.3,
      appraisalDate: '2024-03-01',
    },
    {
      id: '2',
      branch: 'Branch A',
      department: 'HR',
      designation: 'HR Manager',
      employee: 'Jane Smith',
      targetRating: 4.5,
      overallRating: 4.6,
      appraisalDate: '2024-03-05',
    },
    {
      id: '3',
      branch: 'Head Office',
      department: 'Finance',
      designation: 'Accountant',
      employee: 'Bob Wilson',
      targetRating: 4.0,
      overallRating: 3.8,
      appraisalDate: '2024-03-10',
    },
  ]);

  const branches = ['Head Office', 'Branch A', 'Branch B'];
  const employees = ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown', 'Charlie Davis'];

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      branch: '',
      employee: '',
      appraisalDate: '',
      technicalRating: '',
      leadershipRating: '',
      teamworkRating: '',
      communicationRating: '',
      remarks: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const overallRating =
      (parseFloat(formData.technicalRating) +
        parseFloat(formData.leadershipRating) +
        parseFloat(formData.teamworkRating) +
        parseFloat(formData.communicationRating)) /
      4;

    if (editingId) {
      setAppraisals(
        appraisals.map((item) =>
          item.id === editingId
            ? {
                ...item,
                branch: formData.branch,
                employee: formData.employee,
                appraisalDate: formData.appraisalDate,
                overallRating: parseFloat(overallRating.toFixed(1)),
              }
            : item
        )
      );
    } else {
      const newItem: Appraisal = {
        id: Date.now().toString(),
        branch: formData.branch,
        department: 'IT',
        designation: 'Developer',
        employee: formData.employee,
        targetRating: 4.0,
        overallRating: parseFloat(overallRating.toFixed(1)),
        appraisalDate: formData.appraisalDate,
      };
      setAppraisals([...appraisals, newItem]);
    }
    setShowForm(false);
    setFormData({
      branch: '',
      employee: '',
      appraisalDate: '',
      technicalRating: '',
      leadershipRating: '',
      teamworkRating: '',
      communicationRating: '',
      remarks: '',
    });
  };

  const handleEdit = (item: Appraisal) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      branch: item.branch,
      employee: item.employee,
      appraisalDate: item.appraisalDate,
      technicalRating: '',
      leadershipRating: '',
      teamworkRating: '',
      communicationRating: '',
      remarks: '',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this appraisal?')) {
      setAppraisals(appraisals.filter((item) => item.id !== id));
    }
  };

  const handleView = (id: string) => {
    console.log('View appraisal details:', id);
    alert('View appraisal details - Feature to be implemented');
  };

  const filteredData = appraisals.filter(
    (appraisal) =>
      appraisal.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraisal.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appraisal.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRatingBadge = (rating: number, target: number) => {
    if (rating >= target) {
      return 'bg-green-100 text-green-700 hover:bg-green-100';
    } else if (rating >= target - 0.5) {
      return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
    }
    return 'bg-red-100 text-red-700 hover:bg-red-100';
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Appraisals</p>
                <p className="text-2xl font-bold">{appraisals.length}</p>
              </div>
              <Star className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-blue-600">
                  {appraisals.length > 0
                    ? (appraisals.reduce((sum, app) => sum + app.overallRating, 0) / appraisals.length).toFixed(1)
                    : '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Exceeded Target</p>
                <p className="text-2xl font-bold text-green-600">
                  {appraisals.filter((app) => app.overallRating >= app.targetRating).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Below Target</p>
                <p className="text-2xl font-bold text-red-600">
                  {appraisals.filter((app) => app.overallRating < app.targetRating).length}
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
          Create Appraisal
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create New'} Appraisal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select
                    value={formData.employee}
                    onValueChange={(value) => setFormData({ ...formData, employee: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp} value={emp}>
                          {emp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appraisalDate">Appraisal Date</Label>
                  <Input
                    id="appraisalDate"
                    type="date"
                    value={formData.appraisalDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, appraisalDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="technicalRating">Technical Skills (1-5)</Label>
                  <Input
                    id="technicalRating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.technicalRating}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, technicalRating: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadershipRating">Leadership (1-5)</Label>
                  <Input
                    id="leadershipRating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.leadershipRating}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, leadershipRating: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamworkRating">Teamwork (1-5)</Label>
                  <Input
                    id="teamworkRating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.teamworkRating}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, teamworkRating: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="communicationRating">Communication (1-5)</Label>
                  <Input
                    id="communicationRating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.communicationRating}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, communicationRating: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                />
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

      {/* Appraisal List */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by branch, employee, or department..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead className="text-center">Target Rating</TableHead>
                <TableHead className="text-center">Overall Rating</TableHead>
                <TableHead>Appraisal Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No appraisals found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((appraisal) => (
                  <TableRow key={appraisal.id}>
                    <TableCell className="font-medium">{appraisal.branch}</TableCell>
                    <TableCell>{appraisal.department}</TableCell>
                    <TableCell>{appraisal.designation}</TableCell>
                    <TableCell>{appraisal.employee}</TableCell>
                    <TableCell className="text-center font-semibold">{appraisal.targetRating}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={getRatingBadge(appraisal.overallRating, appraisal.targetRating)}>
                        {appraisal.overallRating}
                      </Badge>
                    </TableCell>
                    <TableCell>{appraisal.appraisalDate}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(appraisal.id)} title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(appraisal)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(appraisal.id)}
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
