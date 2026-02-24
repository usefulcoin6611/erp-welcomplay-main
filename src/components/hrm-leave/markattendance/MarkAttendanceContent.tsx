'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, RotateCcw, FileUp, Pencil, Trash2, Loader2 } from 'lucide-react';
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

const BRANCHES = [{ value: '', label: 'Select Branch' }, { value: '1', label: 'Head Office' }, { value: '2', label: 'Branch 2' }];
const DEPARTMENTS = [{ value: '', label: 'Select Department' }, { value: '1', label: 'IT' }, { value: '2', label: 'HR' }, { value: '3', label: 'Finance' }];

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
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAttendance();
  }, []);

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

  const handleEdit = (id: string) => {
    toast.info("Edit feature not implemented");
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this attendance?')) {
      toast.info("Delete feature not implemented in API yet");
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
                <Select value={branch || ' '} onValueChange={(v) => setBranch(v === ' ' ? '' : v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((b) => (
                      <SelectItem key={b.value || 'empty'} value={b.value || ' '}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[140px]">
                <Label>Department</Label>
                <Select value={department || ' '} onValueChange={(v) => setDepartment(v === ' ' ? '' : v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d.value || 'empty'} value={d.value || ' '}>
                        {d.label}
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
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground px-4 py-3">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                records.map((row) => (
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
                          onClick={() => handleEdit(row.id)}
                          title="Edit"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(row.id)}
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
