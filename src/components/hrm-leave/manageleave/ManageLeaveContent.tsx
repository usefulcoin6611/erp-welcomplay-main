'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface Leave {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

export function ManageLeaveContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employeeName: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // Mock data
  const [leaves, setLeaves] = useState<Leave[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      leaveType: 'Annual Leave',
      startDate: '2024-03-15',
      endDate: '2024-03-17',
      days: 3,
      reason: 'Family vacation',
      status: 'Approved',
      appliedDate: '2024-03-01',
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      leaveType: 'Sick Leave',
      startDate: '2024-03-20',
      endDate: '2024-03-21',
      days: 2,
      reason: 'Medical checkup',
      status: 'Pending',
      appliedDate: '2024-03-18',
    },
    {
      id: '3',
      employeeId: 'EMP003',
      employeeName: 'Bob Wilson',
      leaveType: 'Casual Leave',
      startDate: '2024-03-10',
      endDate: '2024-03-10',
      days: 1,
      reason: 'Personal matters',
      status: 'Rejected',
      appliedDate: '2024-03-08',
    },
  ]);

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      employeeName: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;

    if (editingId) {
      setLeaves(
        leaves.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...formData,
                days,
                status: 'Pending' as const,
              }
            : item
        )
      );
    } else {
      const newItem: Leave = {
        id: Date.now().toString(),
        employeeId: 'EMP' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        ...formData,
        days,
        status: 'Pending',
        appliedDate: new Date().toISOString().split('T')[0],
      };
      setLeaves([...leaves, newItem]);
    }
    setShowForm(false);
    setFormData({
      employeeName: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
    });
  };

  const handleEdit = (item: Leave) => {
    setShowForm(true);
    setEditingId(item.id);
    setFormData({
      employeeName: item.employeeName,
      leaveType: item.leaveType,
      startDate: item.startDate,
      endDate: item.endDate,
      reason: item.reason,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this leave request?')) {
      setLeaves(leaves.filter((item) => item.id !== id));
    }
  };

  const handleApprove = (id: string) => {
    setLeaves(leaves.map((item) => (item.id === id ? { ...item, status: 'Approved' as const } : item)));
  };

  const handleReject = (id: string) => {
    setLeaves(leaves.map((item) => (item.id === id ? { ...item, status: 'Rejected' as const } : item)));
  };

  const filteredData = leaves.filter(
    (leave) =>
      leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const leaveTypes = ['Annual Leave', 'Sick Leave', 'Casual Leave', 'Maternity Leave', 'Paternity Leave'];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{leaves.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {leaves.filter((l) => l.status === 'Pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {leaves.filter((l) => l.status === 'Approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {leaves.filter((l) => l.status === 'Rejected').length}
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
          Apply Leave
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Apply'} Leave</h3>
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
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select value={formData.leaveType} onValueChange={(value) => setFormData({ ...formData, leaveType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 shadow-none">
                  {editingId ? 'Update' : 'Submit'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Leave List */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by employee name, ID, or leave type..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Employee Name</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-center">Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.employeeId}</TableCell>
                    <TableCell>{leave.employeeName}</TableCell>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell>{leave.startDate}</TableCell>
                    <TableCell>{leave.endDate}</TableCell>
                    <TableCell className="text-center">{leave.days}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          leave.status === 'Approved'
                            ? 'bg-green-100 text-green-700 hover:bg-green-100'
                            : leave.status === 'Rejected'
                            ? 'bg-red-100 text-red-700 hover:bg-red-100'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                        }
                      >
                        {leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {leave.status === 'Pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(leave.id)}
                              title="Approve"
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(leave.id)}
                              title="Reject"
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEdit(leave)} title="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(leave.id)}
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
