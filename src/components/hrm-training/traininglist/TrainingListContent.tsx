'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Eye, GraduationCap } from 'lucide-react';

interface Training {
  id: string;
  branch: string;
  trainingType: string;
  status: string;
  employee: string;
  trainer: string;
  startDate: string;
  endDate: string;
  cost: number;
}

export function TrainingListContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    branch: '',
    trainingType: '',
    status: '',
    employee: '',
    trainer: '',
    startDate: '',
    endDate: '',
    cost: '',
  });

  // Mock data
  const [trainings, setTrainings] = useState<Training[]>([
    {
      id: '1',
      branch: 'Head Office',
      trainingType: 'Technical Skills',
      status: 'Completed',
      employee: 'John Doe',
      trainer: 'Sarah Johnson',
      startDate: '2024-01-15',
      endDate: '2024-01-19',
      cost: 5000000,
    },
    {
      id: '2',
      branch: 'Branch A',
      trainingType: 'Leadership Development',
      status: 'In Progress',
      employee: 'Jane Smith',
      trainer: 'Michael Brown',
      startDate: '2024-02-01',
      endDate: '2024-02-28',
      cost: 7500000,
    },
    {
      id: '3',
      branch: 'Head Office',
      trainingType: 'Customer Service',
      status: 'Pending',
      employee: 'Bob Wilson',
      trainer: 'Emily Davis',
      startDate: '2024-03-01',
      endDate: '2024-03-05',
      cost: 3000000,
    },
  ]);

  const branches = ['Head Office', 'Branch A', 'Branch B'];
  const trainingTypes = ['Technical Skills', 'Leadership Development', 'Customer Service', 'Sales Training', 'Communication'];
  const statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
  const employees = ['John Doe', 'Jane Smith', 'Bob Wilson'];
  const trainers = ['Sarah Johnson', 'Michael Brown', 'Emily Davis'];

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      branch: '',
      trainingType: '',
      status: '',
      employee: '',
      trainer: '',
      startDate: '',
      endDate: '',
      cost: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setTrainings(
        trainings.map((item) =>
          item.id === editingId
            ? {
                ...item,
                branch: formData.branch,
                trainingType: formData.trainingType,
                status: formData.status,
                employee: formData.employee,
                trainer: formData.trainer,
                startDate: formData.startDate,
                endDate: formData.endDate,
                cost: parseFloat(formData.cost),
              }
            : item
        )
      );
    } else {
      const newItem: Training = {
        id: Date.now().toString(),
        branch: formData.branch,
        trainingType: formData.trainingType,
        status: formData.status,
        employee: formData.employee,
        trainer: formData.trainer,
        startDate: formData.startDate,
        endDate: formData.endDate,
        cost: parseFloat(formData.cost),
      };
      setTrainings([...trainings, newItem]);
    }
    setShowForm(false);
    setFormData({
      branch: '',
      trainingType: '',
      status: '',
      employee: '',
      trainer: '',
      startDate: '',
      endDate: '',
      cost: '',
    });
  };

  const handleEdit = (item: Training) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      branch: item.branch,
      trainingType: item.trainingType,
      status: item.status,
      employee: item.employee,
      trainer: item.trainer,
      startDate: item.startDate,
      endDate: item.endDate,
      cost: item.cost.toString(),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this training?')) {
      setTrainings(trainings.filter((item) => item.id !== id));
    }
  };

  const filteredData = trainings.filter(
    (training) =>
      training.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.trainingType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.trainer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
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
                <p className="text-sm text-muted-foreground">Total Trainings</p>
                <p className="text-2xl font-bold">{trainings.length}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {trainings.filter((t) => t.status === 'Completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {trainings.filter((t) => t.status === 'In Progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold text-purple-600">
                  Rp {trainings.reduce((sum, t) => sum + t.cost, 0).toLocaleString()}
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
          Create Training
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Create New'} Training</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="trainingType">Training Type</Label>
                  <Select
                    value={formData.trainingType}
                    onValueChange={(value) => setFormData({ ...formData, trainingType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select training type" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainingTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="trainer">Trainer</Label>
                  <Select
                    value={formData.trainer}
                    onValueChange={(value) => setFormData({ ...formData, trainer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trainer" />
                    </SelectTrigger>
                    <SelectContent>
                      {trainers.map((trainer) => (
                        <SelectItem key={trainer} value={trainer}>
                          {trainer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Training Cost (Rp)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
                    required
                  />
                </div>
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

      {/* Training List */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by employee, training type, trainer, or branch..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>Training Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Trainer</TableHead>
                <TableHead>Training Duration</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No trainings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell className="font-medium">{training.branch}</TableCell>
                    <TableCell>{training.trainingType}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(training.status)}>{training.status}</Badge>
                    </TableCell>
                    <TableCell>{training.employee}</TableCell>
                    <TableCell>{training.trainer}</TableCell>
                    <TableCell>
                      {training.startDate} to {training.endDate}
                    </TableCell>
                    <TableCell>Rp {training.cost.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(training)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(training.id)}
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
