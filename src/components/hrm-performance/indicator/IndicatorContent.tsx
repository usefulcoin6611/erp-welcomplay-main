'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, TrendingUp, Eye } from 'lucide-react';
import { StarRatingDisplay } from '../StarRatingDisplay';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

interface Indicator {
  id: string;
  branch: string;
  department: string;
  designation: string;
  overallRating: number;
  addedBy: string;
  createdAt: string;
}

export function IndicatorContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    branch: '',
    department: '',
    designation: '',
    technicalRating: '',
    organizationalRating: '',
    customerExperienceRating: '',
  });

  // Mock data
  const [indicators, setIndicators] = useState<Indicator[]>([
    {
      id: '1',
      branch: 'Head Office',
      department: 'IT',
      designation: 'Senior Developer',
      overallRating: 4.5,
      addedBy: 'Admin',
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      branch: 'Branch A',
      department: 'HR',
      designation: 'HR Manager',
      overallRating: 4.2,
      addedBy: 'Admin',
      createdAt: '2024-01-20',
    },
    {
      id: '3',
      branch: 'Head Office',
      department: 'Finance',
      designation: 'Accountant',
      overallRating: 4.8,
      addedBy: 'Admin',
      createdAt: '2024-02-01',
    },
  ]);

  const branches = ['Head Office', 'Branch A', 'Branch B'];
  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Sales'];
  const designations = ['Manager', 'Senior Developer', 'Junior Developer', 'Accountant', 'HR Manager'];

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      branch: '',
      department: '',
      designation: '',
      technicalRating: '',
      organizationalRating: '',
      customerExperienceRating: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const overallRating =
      (parseFloat(formData.technicalRating) +
        parseFloat(formData.organizationalRating) +
        parseFloat(formData.customerExperienceRating)) /
      3;

    if (editingId) {
      setIndicators(
        indicators.map((item) =>
          item.id === editingId
            ? {
                ...item,
                branch: formData.branch,
                department: formData.department,
                designation: formData.designation,
                overallRating: parseFloat(overallRating.toFixed(1)),
              }
            : item
        )
      );
    } else {
      const newItem: Indicator = {
        id: Date.now().toString(),
        branch: formData.branch,
        department: formData.department,
        designation: formData.designation,
        overallRating: parseFloat(overallRating.toFixed(1)),
        addedBy: 'Admin',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setIndicators([...indicators, newItem]);
    }
    setShowForm(false);
    setFormData({
      branch: '',
      department: '',
      designation: '',
      technicalRating: '',
      organizationalRating: '',
      customerExperienceRating: '',
    });
  };

  const handleEdit = (item: Indicator) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      branch: item.branch,
      department: item.department,
      designation: item.designation,
      technicalRating: '',
      organizationalRating: '',
      customerExperienceRating: '',
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this indicator?')) {
      setIndicators(indicators.filter((item) => item.id !== id));
    }
  };

  const handleView = (id: string) => {
    console.log('View indicator details:', id);
    alert('View indicator details - Feature to be implemented');
  };

  const filteredData = indicators.filter(
    (indicator) =>
      indicator.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indicator.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Indicators</p>
                <p className="text-2xl font-bold">{indicators.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-blue-600">
                  {indicators.length > 0
                    ? (indicators.reduce((sum, ind) => sum + ind.overallRating, 0) / indicators.length).toFixed(1)
                    : '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Performers</p>
                <p className="text-2xl font-bold text-green-600">
                  {indicators.filter((ind) => ind.overallRating >= 4.5).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Improvement</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {indicators.filter((ind) => ind.overallRating < 3.5).length}
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
          Create Indicator
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create New'} Indicator</h3>
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
                  <Label htmlFor="designation">Designation</Label>
                  <Select
                    value={formData.designation}
                    onValueChange={(value) => setFormData({ ...formData, designation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select designation" />
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map((desig) => (
                        <SelectItem key={desig} value={desig}>
                          {desig}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="technicalRating">Technical Rating (1-5)</Label>
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
                  <Label htmlFor="organizationalRating">Organizational Rating (1-5)</Label>
                  <Input
                    id="organizationalRating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.organizationalRating}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, organizationalRating: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerExperienceRating">Customer Experience Rating (1-5)</Label>
                  <Input
                    id="customerExperienceRating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.customerExperienceRating}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, customerExperienceRating: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
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

      {/* Indicator List - reference: indicator/index */}
      <Card className={cardClass}>
        <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-medium">Manage Indicator</h3>
          <div className="relative w-full max-w-[280px] ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by branch, department, or designation..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-gray-50 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3">Branch</TableHead>
                <TableHead className="px-4 py-3">Department</TableHead>
                <TableHead className="px-4 py-3">Designation</TableHead>
                <TableHead className="px-4 py-3 text-center">Overall Rating</TableHead>
                <TableHead className="px-4 py-3">Added By</TableHead>
                <TableHead className="px-4 py-3">Created At</TableHead>
                <TableHead className="px-4 py-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground px-4 py-3">
                    No indicators found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((indicator) => (
                  <TableRow key={indicator.id}>
                    <TableCell className="px-4 py-3 font-medium">{indicator.branch}</TableCell>
                    <TableCell className="px-4 py-3">{indicator.department}</TableCell>
                    <TableCell className="px-4 py-3">{indicator.designation}</TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <StarRatingDisplay rating={indicator.overallRating} />
                    </TableCell>
                    <TableCell className="px-4 py-3">{indicator.addedBy}</TableCell>
                    <TableCell className="px-4 py-3">{indicator.createdAt}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(indicator.id)}
                          title="View"
                          className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(indicator)}
                          title="Edit"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(indicator.id)}
                          title="Delete"
                          className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
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
