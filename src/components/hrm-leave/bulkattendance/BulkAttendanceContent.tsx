'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Save, Download, Upload } from 'lucide-react';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  selected: boolean;
}

export function BulkAttendanceContent() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bulkStatus, setBulkStatus] = useState<'Present' | 'Absent' | 'Half Day' | 'Late'>('Present');
  const [department, setDepartment] = useState('all');

  // Mock employees data
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', employeeId: 'EMP001', name: 'John Doe', department: 'IT', selected: false },
    { id: '2', employeeId: 'EMP002', name: 'Jane Smith', department: 'HR', selected: false },
    { id: '3', employeeId: 'EMP003', name: 'Bob Wilson', department: 'Finance', selected: false },
    { id: '4', employeeId: 'EMP004', name: 'Alice Brown', department: 'Marketing', selected: false },
    { id: '5', employeeId: 'EMP005', name: 'Charlie Davis', department: 'IT', selected: false },
    { id: '6', employeeId: 'EMP006', name: 'Diana Evans', department: 'HR', selected: false },
  ]);

  const departments = ['all', 'IT', 'HR', 'Finance', 'Marketing'];

  const handleSelectAll = () => {
    setEmployees(employees.map((emp) => ({ ...emp, selected: true })));
  };

  const handleDeselectAll = () => {
    setEmployees(employees.map((emp) => ({ ...emp, selected: false })));
  };

  const handleToggleEmployee = (id: string) => {
    setEmployees(employees.map((emp) => (emp.id === id ? { ...emp, selected: !emp.selected } : emp)));
  };

  const handleApplyBulkAttendance = () => {
    const selectedEmployees = employees.filter((emp) => emp.selected);
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }
    if (!startDate || !endDate) {
      alert('Please select date range');
      return;
    }

    console.log('Applying bulk attendance:', {
      employees: selectedEmployees,
      startDate,
      endDate,
      status: bulkStatus,
    });
    alert(
      `Bulk attendance applied successfully!\n${selectedEmployees.length} employee(s) marked as ${bulkStatus} from ${startDate} to ${endDate}`
    );
  };

  const handleExportTemplate = () => {
    console.log('Exporting attendance template');
    alert('Attendance template exported successfully!');
  };

  const handleImportAttendance = () => {
    console.log('Importing attendance data');
    alert('Attendance data imported successfully!');
  };

  const filteredEmployees =
    department === 'all' ? employees : employees.filter((emp) => emp.department === department);

  const selectedCount = filteredEmployees.filter((emp) => emp.selected).length;

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Bulk Attendance Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={bulkStatus} onValueChange={(value: any) => setBulkStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  <SelectItem value="Absent">Absent</SelectItem>
                  <SelectItem value="Half Day">Half Day</SelectItem>
                  <SelectItem value="Late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Filter by Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button onClick={handleApplyBulkAttendance} className="w-full bg-blue-500 hover:bg-blue-600 shadow-none">
                <Save className="w-4 h-4 mr-2" />
                Apply to Selected
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import/Export */}
      <div className="flex gap-4 flex-wrap">
        <Button variant="outline" onClick={handleExportTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Export Template
        </Button>
        <Button variant="outline" onClick={handleImportAttendance}>
          <Upload className="w-4 h-4 mr-2" />
          Import Attendance
        </Button>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Select Employees ({selectedCount} of {filteredEmployees.length} selected)
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={employee.selected}
                        onChange={() => handleToggleEmployee(employee.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{employee.employeeId}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell className="text-center">
                      {employee.selected && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          Will be marked as {bulkStatus}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{filteredEmployees.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Selected</p>
                <p className="text-2xl font-bold text-blue-600">{selectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Date Range</p>
                <p className="text-lg font-semibold">
                  {startDate && endDate
                    ? `${Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)) + 1} days`
                    : 'Not set'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
