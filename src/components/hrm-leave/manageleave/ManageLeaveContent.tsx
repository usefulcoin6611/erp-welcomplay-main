'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
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
import { Plus, Pencil, Trash2, Search, Calendar, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

interface Leave {
  id: string;
  employeeId: string;      // Employee code e.g. EMP001
  employeeDbId: string;    // Employee.id (Prisma)
  employeeName: string;
  leaveTypeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

function splitReasonAndRemark(combined: string | null | undefined): {
  reason: string;
  remark: string;
} {
  if (!combined) {
    return { reason: '', remark: '' };
  }

  const marker = '\n\nRemark:';
  const index = combined.indexOf(marker);

  if (index === -1) {
    return { reason: combined, remark: '' };
  }

  const reason = combined.slice(0, index).trimEnd();
  const remarkRaw = combined.slice(index + marker.length).trim();

  return {
    reason: reason || '',
    remark: remarkRaw || '',
  };
}

export function ManageLeaveContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string; employeeId: string }[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<{ id: string; name: string; daysPerYear: number }[]>([]);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<Leave | null>(null);
  const [statusAlertOpen, setStatusAlertOpen] = useState(false);
  const [pendingStatusAction, setPendingStatusAction] = useState<'Approved' | 'Rejected' | null>(null);
  const [pendingStatusLeave, setPendingStatusLeave] = useState<Leave | null>(null);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: '', // This will store ID
    startDate: '',
    endDate: '',
    reason: '',
    remark: '',
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
             employeeDbId: item.employeeId,
             employeeName: item.employee?.name || '-',
             leaveTypeId: item.leaveType?.id || '',
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
      remark: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (
      !formData.employeeId ||
      !formData.leaveType ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason ||
      !formData.remark
    ) {
        toast.error("Please fill all required fields");
        return;
    }

    try {
        const composedReason = `${formData.reason}\n\nRemark: ${formData.remark}`;
        const payload = {
            employeeId: formData.employeeId,
            leaveTypeId: formData.leaveType, // This stores the ID
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: composedReason,
        };

        const isEdit = Boolean(editingId);
        const url = isEdit ? `/api/hrm/leaves/${editingId}` : '/api/hrm/leaves';
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        
        if (data.success) {
            toast.success(isEdit ? "Leave updated successfully" : "Leave requested successfully");
            fetchLeaves();
            setShowForm(false);
            setFormData({
                employeeId: '',
                leaveType: '',
                startDate: '',
                endDate: '',
                reason: '',
                remark: '',
            });
            setEditingId(null);
        } else {
            toast.error(data.message || (isEdit ? "Failed to update leave" : "Failed to request leave"));
        }
    } catch (error) {
        console.error("Error submitting leave:", error);
        toast.error("An error occurred");
    }
  };

  const handleEdit = (item: Leave) => {
    const employee = employees.find(
      (e) => e.id === item.employeeDbId || e.employeeId === item.employeeId,
    );

    const { reason, remark } = splitReasonAndRemark(item.reason);

    setFormData({
      employeeId: employee ? employee.id : '',
      leaveType: item.leaveTypeId || '',
      startDate: item.startDate,
      endDate: item.endDate,
      reason,
      remark,
    });

    setEditingId(item.id);
    setShowForm(true);
  };

  const openDeleteDialog = (leave: Leave) => {
    setLeaveToDelete(leave);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!leaveToDelete) {
      setDeleteAlertOpen(false);
      return;
    }

    try {
      const response = await fetch(`/api/hrm/leaves/${leaveToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Leave request deleted');
        fetchLeaves();
      } else {
        toast.error(data.message || 'Failed to delete leave');
      }
    } catch (error) {
      toast.error('Failed to delete leave');
    } finally {
      setDeleteAlertOpen(false);
      setLeaveToDelete(null);
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

  const openStatusDialog = (leave: Leave, action: 'Approved' | 'Rejected') => {
    setPendingStatusLeave(leave);
    setPendingStatusAction(action);
    setStatusAlertOpen(true);
  };

  const handleStatusConfirm = async () => {
    if (!pendingStatusLeave || !pendingStatusAction) {
      setStatusAlertOpen(false);
      return;
    }

    if (pendingStatusAction === 'Approved') {
      await handleApprove(pendingStatusLeave.id);
    } else {
      await handleReject(pendingStatusLeave.id);
    }

    setStatusAlertOpen(false);
    setPendingStatusLeave(null);
    setPendingStatusAction(null);
  };

  const filteredData = leaves.filter(
    (leave) =>
      leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

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

      {/* Apply / Edit Leave Modal */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => {
          setShowForm(open);
          if (!open) {
            setEditingId(null);
            setFormData({
              employeeId: '',
              leaveType: '',
              startDate: '',
              endDate: '',
              reason: '',
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Leave' : 'Apply Leave'}</DialogTitle>
            <DialogDescription>
              Isi detail pengajuan cuti sesuai dengan kebijakan perusahaan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">
                  Employee <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.employeeId}
                  onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                >
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
                <p className="text-xs text-muted-foreground">
                  Create employee here.{' '}
                  <Link
                    href="/hrm/employees"
                    className="font-medium text-primary hover:underline"
                  >
                    Create employee
                  </Link>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="leaveType">
                  Leave Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.leaveType}
                  onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                        {type.daysPerYear > 0 ? ` (${type.daysPerYear} days / year)` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Create leave type here.{' '}
                  <Link
                    href="/hrm/setup/leave-type"
                    className="font-medium text-primary hover:underline"
                  >
                    Create leave type
                  </Link>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">
                  Start Date <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="endDate">
                  End Date <span className="text-red-500">*</span>
                </Label>
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
              <Label htmlFor="reason">
                Leave Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder="Tuliskan alasan pengajuan cuti"
                className="min-h-[100px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remark">
                Remark <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="remark"
                value={formData.remark}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, remark: e.target.value })
                }
                placeholder="Catatan tambahan terkait pengajuan cuti"
                className="min-h-[80px]"
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700 shadow-none"
              >
                {editingId ? 'Update' : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
                <TableHead className="px-4 py-3">Applied On</TableHead>
                <TableHead className="px-4 py-3">Start Date</TableHead>
                <TableHead className="px-4 py-3">End Date</TableHead>
                <TableHead className="px-4 py-3 text-center">Total Days</TableHead>
                <TableHead className="px-4 py-3">Leave Reason</TableHead>
                <TableHead className="px-4 py-3 text-center">Status</TableHead>
                <TableHead className="px-4 py-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {paginatedData.length === 0 ? (
                <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground px-4 py-3">
                  No leave requests found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="px-4 py-3 font-medium">{leave.employeeId}</TableCell>
                    <TableCell className="px-4 py-3">{leave.employeeName}</TableCell>
                    <TableCell className="px-4 py-3">{leave.leaveType}</TableCell>
                    <TableCell className="px-4 py-3">{leave.appliedDate}</TableCell>
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
                              onClick={() => openStatusDialog(leave, 'Approved')}
                              title="Approve"
                              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openStatusDialog(leave, 'Rejected')}
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
                          onClick={() => openDeleteDialog(leave)}
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
          <div className="flex items-center justify-between gap-4 px-4 py-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page</span>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20 px-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="min-w-[60px]">
                    <SelectItem value="5" className="justify-center">5</SelectItem>
                    <SelectItem value="10" className="justify-center">10</SelectItem>
                    <SelectItem value="20" className="justify-center">20</SelectItem>
                    <SelectItem value="50" className="justify-center">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="h-8 w-8">
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="h-8 w-8">
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Leave?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Leave request akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2">
            <AlertDialogCancel type="button">Batal</AlertDialogCancel>
            <AlertDialogAction type="button" onClick={handleDeleteConfirm}>
              <span>Hapus</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={statusAlertOpen} onOpenChange={setStatusAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatusAction === 'Approved'
                ? 'Approve Leave Request?'
                : 'Reject Leave Request?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatusAction === 'Approved'
                ? 'Apakah Anda yakin ingin menyetujui pengajuan cuti ini?'
                : 'Apakah Anda yakin ingin menolak pengajuan cuti ini?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 sm:gap-2">
            <AlertDialogCancel type="button">Batal</AlertDialogCancel>
            <AlertDialogAction type="button" onClick={handleStatusConfirm}>
              <span>{pendingStatusAction === 'Approved' ? 'Approve' : 'Reject'}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
