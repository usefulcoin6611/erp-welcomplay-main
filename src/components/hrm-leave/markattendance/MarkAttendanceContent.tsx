'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Search, RotateCcw, FileUp, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { toast } from 'sonner';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

interface AttendanceRecord {
  id: string;
  employeeName: string;
  date: string;
  status: string;
  clockIn: string;
  clockOut: string;
  late: string;
  earlyLeaving: string;
  overtime: string;
}

const ALL_OPTION = '__all__';

type BranchOption = {
  id: string;
  name: string;
};

type DepartmentOption = {
  id: string;
  name: string;
  branchName?: string;
};

export function MarkAttendanceContent() {
  const [filterType, setFilterType] = useState<'monthly' | 'daily'>('monthly');
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [date, setDate] = useState('');
  const [branch, setBranch] = useState('');
  const [department, setDepartment] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState('Present');
  const [editClockIn, setEditClockIn] = useState('');
  const [editClockOut, setEditClockOut] = useState('');
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecord | null>(null);

  const fetchAttendance = async () => {
    try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterType === 'monthly' && month) params.append('month', month);
        if (filterType === 'daily' && date) params.append('date', date);
        if (branch) params.append('branchId', branch);
        if (department) params.append('departmentId', department);

        const response = await fetch(`/api/hrm/attendance?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
            const mapped = data.data.map((item: any) => ({
                id: item.id,
                employeeName: item.employee?.name || '-',
                date: item.date.split('T')[0],
                status: item.status,
                clockIn: item.clockIn ? new Date(item.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
                clockOut: item.clockOut ? new Date(item.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
                late: item.late || '-',
                earlyLeaving: item.earlyLeaving || '-',
                overtime: item.overtime || '-',
            }));
            setRecords(mapped);
        } else {
            toast.error(data.message || "Failed to fetch attendance");
        }
    } catch (error) {
        console.error("Error fetching attendance:", error);
        toast.error("Failed to fetch attendance");
    } finally {
        setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      const json = await res.json();
      if (json.success) {
        setBranches(json.data ?? []);
      } else {
        toast.error(json.message || 'Gagal memuat data branch');
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Gagal memuat data branch');
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      const json = await res.json();
      if (json.success) {
        const mapped: DepartmentOption[] = (json.data ?? []).map((d: any) => ({
          id: d.id,
          name: d.name,
          branchName: d.branch?.name,
        }));
        setDepartments(mapped);
      } else {
        toast.error(json.message || 'Gagal memuat data department');
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Gagal memuat data department');
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchBranches();
    fetchDepartments();
  }, []);

  const filteredData = records;
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handleSearchChange = (/* value: string */) => {
    // search handled by filters; reset page if needed
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const handleApply = () => {
    fetchAttendance();
  };

  const handleReset = () => {
    setFilterType('monthly');
    const d = new Date();
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    setDate('');
    setBranch('');
    setDepartment('');
    // fetchAttendance(); // Optional: auto fetch on reset?
  };

  const handleImport = () => {
    toast.info("Import feature not implemented");
  };

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditStatus(record.status || 'Present');
    setEditClockIn(record.clockIn && record.clockIn !== '-' ? record.clockIn : '');
    setEditClockOut(record.clockOut && record.clockOut !== '-' ? record.clockOut : '');
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    try {
      const payload = {
        date: editingRecord.date,
        status: editStatus,
        clockIn: editClockIn || null,
        clockOut: editClockOut || null,
      };

      const response = await fetch(`/api/hrm/attendance/${editingRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Attendance updated');
        setEditOpen(false);
        setEditingRecord(null);
        fetchAttendance();
      } else {
        toast.error(data.message || 'Failed to update attendance');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Failed to update attendance');
    }
  };

  const openDeleteDialog = (record: AttendanceRecord) => {
    setRecordToDelete(record);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) {
      setDeleteAlertOpen(false);
      return;
    }

    try {
      const response = await fetch(`/api/hrm/attendance/${recordToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Attendance deleted');
        fetchAttendance();
      } else {
        toast.error(data.message || 'Failed to delete attendance');
      }
    } catch (error) {
      console.error('Error deleting attendance:', error);
      toast.error('Failed to delete attendance');
    } finally {
      setDeleteAlertOpen(false);
      setRecordToDelete(null);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter card - reference: attendance/index */}
      <Card className={cardClass}>
        <CardContent className="px-4 py-4">
          <div className="row align-items-center justify-content-end flex flex-wrap gap-4 items-end">
            <div className="flex flex-wrap gap-4 flex-1">
              <div className="space-y-2 min-w-[140px]">
                <Label>Type</Label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="monthly"
                      checked={filterType === 'monthly'}
                      onChange={() => setFilterType('monthly')}
                      className="rounded-full"
                    />
                    <span className="text-sm">Monthly</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value="daily"
                      checked={filterType === 'daily'}
                      onChange={() => setFilterType('daily')}
                      className="rounded-full"
                    />
                    <span className="text-sm">Daily</span>
                  </label>
                </div>
              </div>
              {filterType === 'monthly' && (
                <div className="space-y-2 min-w-[140px]">
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={month}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonth(e.target.value)}
                    className="h-9"
                  />
                </div>
              )}
              {filterType === 'daily' && (
                <div className="space-y-2 min-w-[140px]">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                    className="h-9"
                  />
                </div>
              )}
              <div className="space-y-2 min-w-[140px]">
                <Label>Branch</Label>
                <Select
                  value={branch || ALL_OPTION}
                  onValueChange={(v) => setBranch(v === ALL_OPTION ? '' : v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_OPTION}>All Branches</SelectItem>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.name}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[140px]">
                <Label>Department</Label>
                <Select
                  value={department || ALL_OPTION}
                  onValueChange={(v) => setDepartment(v === ALL_OPTION ? '' : v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_OPTION}>All Departments</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.name}>
                        {d.name}
                        {d.branchName ? ` (${d.branchName})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" onClick={handleApply} className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
                <Search className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset} className="bg-red-50 text-red-700 hover:bg-red-100 border-red-100">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleImport}
                className="border-0 bg-amber-50 text-amber-800 hover:bg-amber-100"
              >
                <FileUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table - reference: attendance/index columns */}
      <Card className={cardClass}>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3">Employee</TableHead>
                <TableHead className="px-4 py-3">Date</TableHead>
                <TableHead className="px-4 py-3">Status</TableHead>
                <TableHead className="px-4 py-3">Clock In</TableHead>
                <TableHead className="px-4 py-3">Clock Out</TableHead>
                <TableHead className="px-4 py-3">Late</TableHead>
                <TableHead className="px-4 py-3">Early Leaving</TableHead>
                <TableHead className="px-4 py-3">Overtime</TableHead>
                <TableHead className="px-4 py-3 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground px-4 py-3">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="px-4 py-3 font-medium">{row.employeeName}</TableCell>
                    <TableCell className="px-4 py-3">{row.date}</TableCell>
                    <TableCell className="px-4 py-3">{row.status}</TableCell>
                    <TableCell className="px-4 py-3">{row.clockIn !== '00:00' ? row.clockIn : '00:00'}</TableCell>
                    <TableCell className="px-4 py-3">{row.clockOut !== '00:00' ? row.clockOut : '00:00'}</TableCell>
                    <TableCell className="px-4 py-3">{row.late}</TableCell>
                    <TableCell className="px-4 py-3">{row.earlyLeaving}</TableCell>
                    <TableCell className="px-4 py-3">{row.overtime}</TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(row)}
                          title="Edit"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteDialog(row)}
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

      {/* Edit Attendance Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setEditingRecord(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{editingRecord?.employeeName}</span>
                <span className="text-muted-foreground">{editingRecord?.date}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editStatus}
                onValueChange={(value) => setEditStatus(value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clockIn">Clock In</Label>
                <Input
                  id="clockIn"
                  type="time"
                  value={editClockIn}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditClockIn(e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clockOut">Clock Out</Label>
                <Input
                  id="clockOut"
                  type="time"
                  value={editClockOut}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditClockOut(e.target.value)
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Attendance?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Attendance record akan dihapus secara permanen.
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
    </div>
  );
}
