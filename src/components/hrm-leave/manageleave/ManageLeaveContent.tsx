'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

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
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<{id: string, name: string, employeeId: string}[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<{id: string, name: string}[]>([]);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: '', // This will store ID
    startDate: '',
    endDate: '',
    reason: '',
  });

  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch('/api/hrm/leave-types');
      const data = await response.json();
      if (data.success) {
        setLeaveTypes(data.data);
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
    }
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hrm/leaves');
      const data = await response.json();
      if (data.success) {
        const mappedData = data.data.map((item: any) => {
           const start = new Date(item.startDate);
           const end = new Date(item.endDate);
           const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
           return {
             id: item.id,
             employeeId: item.employee?.employeeId || '-',
             employeeName: item.employee?.name || '-',
             leaveType: item.leaveType?.name || '-', // Assuming relation is included
             startDate: item.startDate.split('T')[0],
             endDate: item.endDate.split('T')[0],
             days,
             reason: item.reason,
             status: item.status,
             appliedDate: item.createdAt.split('T')[0],
           };
        });
        setLeaves(mappedData);
      } else {
        toast.error(data.message || 'Failed to fetch leaves');
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/hrm/payroll/set-salary'); // Reusing this endpoint to get employees list
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data.map((e: any) => ({ id: e.id, name: e.name, employeeId: e.employeeId })));
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
    fetchLeaveTypes();
  }, []);

  const handleAdd = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData({
      employeeId: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.employeeId || !formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
        toast.error("Please fill all fields");
        return;
    }

    try {
        const payload = {
            employeeId: formData.employeeId,
            leaveTypeId: formData.leaveType, // This now stores the ID
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: formData.reason
        };

        const response = await fetch('/api/hrm/leaves', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        
        if (data.success) {
            toast.success("Leave requested successfully");
            fetchLeaves();
            setShowForm(false);
            setFormData({
                employeeId: '',
                leaveType: '',
                startDate: '',
                endDate: '',
                reason: '',
            });
        } else {
            toast.error(data.message || "Failed to request leave");
        }
    } catch (error) {
        console.error("Error submitting leave:", error);
        toast.error("An error occurred");
    }
  };

  const handleEdit = (item: Leave) => {
    // Edit logic would go here - usually PUT to /api/hrm/leaves/[id]
    // Since my API currently only supports status update on PUT, I might not support full edit yet.
    // I'll just show toast.
    toast.info("Edit feature not fully implemented in API yet (Status update only)");
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this leave request?')) {
      try {
        const response = await fetch(`/api/hrm/leaves/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
            toast.success("Leave request deleted");
            fetchLeaves();
        } else {
            toast.error(data.message);
        }
      } catch (error) {
        toast.error("Failed to delete leave");
      }
    }
  };

  const handleApprove = async (id: string) => {
    try {
        const response = await fetch(`/api/hrm/leaves/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Approved' }),
        });
        const data = await response.json();
        if (data.success) {
            toast.success("Leave approved");
            fetchLeaves();
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error("Failed to approve leave");
    }
  };

  const handleReject = async (id: string) => {
    try {
        const response = await fetch(`/api/hrm/leaves/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Rejected' }),
        });
        const data = await response.json();
        if (data.success) {
            toast.success("Leave rejected");
            fetchLeaves();
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error("Failed to reject leave");
    }
  };

  const filteredData = leaves.filter(
    (leave) =>
      leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{leaves.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
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
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
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
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
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
        <Button onClick={handleAdd} className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
          <Plus className="w-4 h-4 mr-2" />
          Apply Leave
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className={cardClass}>
          <CardContent className="px-4 py-4 pt-6">
            <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit' : 'Apply'} Leave</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee Name</Label>
                  <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} ({emp.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select value={formData.leaveType} onValueChange={(value) => setFormData({ ...formData, leaveType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
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
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
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
      <Card className={cardClass}>
        <CardHeader className="px-4 py-3 border-b flex flex-row items-center justify-between gap-4">
          <h3 className="text-sm font-medium">Leave Requests</h3>
          <div className="relative w-full max-w-[280px] ml-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by employee name, ID, or leave type..."
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
                <TableHead className="px-4 py-3">Employee ID</TableHead>
                <TableHead className="px-4 py-3">Employee Name</TableHead>
                <TableHead className="px-4 py-3">Leave Type</TableHead>
                <TableHead className="px-4 py-3">Start Date</TableHead>
                <TableHead className="px-4 py-3">End Date</TableHead>
                <TableHead className="px-4 py-3 text-center">Days</TableHead>
                <TableHead className="px-4 py-3">Reason</TableHead>
                <TableHead className="px-4 py-3 text-center">Status</TableHead>
                <TableHead className="px-4 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground px-4 py-3">
                    No leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="px-4 py-3 font-medium">{leave.employeeId}</TableCell>
                    <TableCell className="px-4 py-3">{leave.employeeName}</TableCell>
                    <TableCell className="px-4 py-3">{leave.leaveType}</TableCell>
                    <TableCell className="px-4 py-3">{leave.startDate}</TableCell>
                    <TableCell className="px-4 py-3">{leave.endDate}</TableCell>
                    <TableCell className="px-4 py-3 text-center">{leave.days}</TableCell>
                    <TableCell className="px-4 py-3 max-w-[200px] truncate">{leave.reason}</TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Badge
                        className={
                          leave.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : leave.status === 'Rejected'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                        }
                      >
                        {leave.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {leave.status === 'Pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(leave.id)}
                              title="Approve"
                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(leave.id)}
                              title="Reject"
                              className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(leave)}
                          title="Edit"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(leave.id)}
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
