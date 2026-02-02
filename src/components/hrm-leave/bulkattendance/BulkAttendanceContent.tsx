'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import Link from 'next/link';

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

const BRANCHES = [{ value: '', label: 'Select Branch' }, { value: '1', label: 'Head Office' }, { value: '2', label: 'Branch 2' }];
const DEPARTMENTS = [{ value: '', label: 'Select Department' }, { value: '1', label: 'IT' }, { value: '2', label: 'HR' }, { value: '3', label: 'Finance' }];

const MOCK_EMPLOYEES: Omit<Employee, 'present' | 'clockIn' | 'clockOut'>[] = [
  { id: '1', employeeId: 'EMP001', name: 'John Doe', branch: 'Head Office', department: 'IT' },
  { id: '2', employeeId: 'EMP002', name: 'Jane Smith', branch: 'Head Office', department: 'HR' },
  { id: '3', employeeId: 'EMP003', name: 'Bob Wilson', branch: 'Head Office', department: 'Finance' },
  { id: '4', employeeId: 'EMP004', name: 'Alice Brown', branch: 'Head Office', department: 'Marketing' },
  { id: '5', employeeId: 'EMP005', name: 'Charlie Davis', branch: 'Head Office', department: 'IT' },
];

export function BulkAttendanceContent() {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [branch, setBranch] = useState('');
  const [department, setDepartment] = useState('');
  const [employees, setEmployees] = useState<Employee[]>(() =>
    MOCK_EMPLOYEES.map((e) => ({
      ...e,
      present: true,
      clockIn: DEFAULT_CLOCK_IN,
      clockOut: DEFAULT_CLOCK_OUT,
    }))
  );

  const handleApply = () => {
    if (!branch || !department) {
      alert('Branch & Department field required.');
      return;
    }
    console.log('Apply filter', { filterDate, branch, department });
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

  const handleUpdate = () => {
    if (!branch || !department) {
      alert('Branch & Department field required.');
      return;
    }
    console.log('Update bulk attendance', { filterDate, branch, department, employees });
    alert('Employee attendance successfully created.');
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
