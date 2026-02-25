'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  branch: string;
  department: string;
  present: boolean;
  clockIn: string;
  clockOut: string;
}

const DEFAULT_CLOCK_IN = '09:00';
const DEFAULT_CLOCK_OUT = '17:00';

type BranchOption = {
  id: string;
  name: string;
};

type DepartmentOption = {
  id: string;
  name: string;
  branchName?: string;
};

export function BulkAttendanceContent() {
  const ALL_OPTION = '__all__';

  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [branch, setBranch] = useState('');
  const [department, setDepartment] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

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

  const fetchEmployees = async () => {
    try {
        setLoading(true);
        const response = await fetch('/api/hrm/payroll/set-salary'); 
        const data = await response.json();
        
        if (data.success) {
            const mapped = data.data.map((emp: any) => ({
                id: emp.id,
                employeeId: emp.employeeId,
                name: emp.name,
                branch: emp.branch || '',
                department: emp.department,
                present: true,
                clockIn: DEFAULT_CLOCK_IN,
                clockOut: DEFAULT_CLOCK_OUT,
            }));
            
            const filtered = mapped.filter((e: Employee) => {
                if (branch && e.branch !== branch) return false;
                if (department && e.department !== department) return false;
                return true;
            });

            setEmployees(filtered);
        } else {
            toast.error("Failed to fetch employees");
        }
    } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Failed to fetch employees");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchDepartments();
  }, []);

  const handleApply = () => {
    if (!branch && !department) {
      // Allow fetching all if no filter? Or require at least one?
      // For UX, let's fetch all if empty or just fetch.
    }
    fetchEmployees();
  };

  const handlePresentAllChange = (checked: boolean) => {
    setEmployees((prev) =>
      prev.map((e) => ({
        ...e,
        present: checked,
        clockIn: checked ? e.clockIn : DEFAULT_CLOCK_IN,
        clockOut: checked ? e.clockOut : DEFAULT_CLOCK_OUT,
      }))
    );
  };

  const handlePresentChange = (id: string, present: boolean) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, present, clockIn: present ? e.clockIn : DEFAULT_CLOCK_IN, clockOut: present ? e.clockOut : DEFAULT_CLOCK_OUT }
          : e
      )
    );
  };

  const handleClockInChange = (id: string, value: string) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, clockIn: value } : e)));
  };

  const handleClockOutChange = (id: string, value: string) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, clockOut: value } : e)));
  };

  const handleUpdate = async () => {
    if (employees.length === 0) {
        toast.warning("No employees to update");
        return;
    }

    try {
        const payload = {
            date: filterDate,
            employees: employees.filter(e => e.present).map(e => ({
                employeeId: e.id,
                status: 'Present',
                clockIn: e.clockIn,
                clockOut: e.clockOut
            }))
        };
        
        // Also handle absent? For now only present ones.
        // Or send all and let backend handle status based on present flag?
        // Logic above only sends present employees.

        const response = await fetch('/api/hrm/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        if (data.success) {
            toast.success("Attendance updated successfully");
        } else {
            toast.error(data.message || "Failed to update attendance");
        }
    } catch (error) {
        console.error("Error updating attendance:", error);
        toast.error("Failed to update attendance");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter card - reference: attendance/bulk */}
      <Card className={cardClass}>
        <CardContent className="px-4 py-4">
          <div className="flex flex-wrap gap-4 items-end justify-between">
            <div className="flex flex-wrap gap-4 flex-1">
              <div className="space-y-2 min-w-[140px]">
                <Label htmlFor="bulkDate">Date</Label>
                <Input
                  id="bulkDate"
                  type="date"
                  value={filterDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterDate(e.target.value)}
                  className="h-9"
                  placeholder="Select Date"
                />
              </div>
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
            <Button size="sm" onClick={handleApply} className="bg-blue-600 text-white hover:bg-blue-700 shadow-none shrink-0">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table - reference: attendance/bulk (Employee Id, Employee, Branch, Department, Attendance checkbox + In/Out) */}
      <Card className={cardClass}>
        <CardContent className="p-0">
          <div className="table-responsive overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4 py-3 w-[10%]">Employee Id</TableHead>
                  <TableHead className="px-4 py-3">Employee</TableHead>
                  <TableHead className="px-4 py-3">Branch</TableHead>
                  <TableHead className="px-4 py-3">Department</TableHead>
                  <TableHead className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="present_all"
                        checked={employees.every((e) => e.present)}
                        onChange={(e) => handlePresentAllChange(e.target.checked)}
                        className="w-4 h-4 cursor-pointer rounded"
                      />
                      <Label htmlFor="present_all" className="font-semibold cursor-pointer mb-0">
                        Attendance
                      </Label>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="px-4 py-3">
                      <Link href="/hrm/employees" className="text-primary hover:underline font-medium">
                        {emp.employeeId}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3">{emp.name}</TableCell>
                    <TableCell className="px-4 py-3">{emp.branch}</TableCell>
                    <TableCell className="px-4 py-3">{emp.department}</TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`present-${emp.id}`}
                            checked={emp.present}
                            onChange={(e) => handlePresentChange(emp.id, e.target.checked)}
                            className="w-4 h-4 cursor-pointer rounded"
                          />
                          <Label htmlFor={`present-${emp.id}`} className="cursor-pointer mb-0 text-sm" />
                        </div>
                        {emp.present && (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs mb-0 whitespace-nowrap">In</Label>
                              <Input
                                type="time"
                                value={emp.clockIn}
                                onChange={(e) => handleClockInChange(emp.id, e.target.value)}
                                className="h-8 w-[100px]"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-xs mb-0 whitespace-nowrap">Out</Label>
                              <Input
                                type="time"
                                value={emp.clockOut}
                                onChange={(e) => handleClockOutChange(emp.id, e.target.value)}
                                className="h-8 w-[100px]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-end px-4 py-4 border-t">
            <Button onClick={handleUpdate} className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
