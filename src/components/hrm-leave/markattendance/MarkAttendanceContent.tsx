'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Save, Calendar } from 'lucide-react';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  department: string;
}

interface Attendance {
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Late';
  clockIn?: string;
  clockOut?: string;
  notes?: string;
}

export function MarkAttendanceContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock employees data
  const employees: Employee[] = [
    { id: '1', employeeId: 'EMP001', name: 'John Doe', department: 'IT' },
    { id: '2', employeeId: 'EMP002', name: 'Jane Smith', department: 'HR' },
    { id: '3', employeeId: 'EMP003', name: 'Bob Wilson', department: 'Finance' },
    { id: '4', employeeId: 'EMP004', name: 'Alice Brown', department: 'Marketing' },
  ];

  // Mock attendance data
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([
    {
      employeeId: 'EMP001',
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
      clockIn: '09:00',
      clockOut: '17:00',
    },
    {
      employeeId: 'EMP002',
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
      clockIn: '09:15',
      clockOut: '17:30',
    },
    {
      employeeId: 'EMP003',
      date: new Date().toISOString().split('T')[0],
      status: 'Late',
      clockIn: '10:00',
      clockOut: '17:00',
    },
    {
      employeeId: 'EMP004',
      date: new Date().toISOString().split('T')[0],
      status: 'Absent',
    },
  ]);

  const getAttendance = (employeeId: string): Attendance | undefined => {
    return attendanceRecords.find((a) => a.employeeId === employeeId && a.date === selectedDate);
  };

  const handleStatusChange = (employeeId: string, status: 'Present' | 'Absent' | 'Half Day' | 'Late') => {
    const existingIndex = attendanceRecords.findIndex((a) => a.employeeId === employeeId && a.date === selectedDate);
    
    if (existingIndex >= 0) {
      const updated = [...attendanceRecords];
      updated[existingIndex] = { ...updated[existingIndex], status };
      setAttendanceRecords(updated);
    } else {
      setAttendanceRecords([
        ...attendanceRecords,
        {
          employeeId,
          date: selectedDate,
          status,
        },
      ]);
    }
  };

  const handleClockInChange = (employeeId: string, clockIn: string) => {
    const existingIndex = attendanceRecords.findIndex((a) => a.employeeId === employeeId && a.date === selectedDate);
    
    if (existingIndex >= 0) {
      const updated = [...attendanceRecords];
      updated[existingIndex] = { ...updated[existingIndex], clockIn };
      setAttendanceRecords(updated);
    } else {
      setAttendanceRecords([
        ...attendanceRecords,
        {
          employeeId,
          date: selectedDate,
          status: 'Present',
          clockIn,
        },
      ]);
    }
  };

  const handleClockOutChange = (employeeId: string, clockOut: string) => {
    const existingIndex = attendanceRecords.findIndex((a) => a.employeeId === employeeId && a.date === selectedDate);
    
    if (existingIndex >= 0) {
      const updated = [...attendanceRecords];
      updated[existingIndex] = { ...updated[existingIndex], clockOut };
      setAttendanceRecords(updated);
    }
  };

  const handleSaveAll = () => {
    console.log('Saving attendance for date:', selectedDate);
    console.log('Records:', attendanceRecords.filter((a) => a.date === selectedDate));
    alert('Attendance saved successfully!');
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Date Selection and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="attendanceDate">Select Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="attendanceDate"
                  type="date"
                  value={selectedDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="search">Search Employee</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by name, ID, or department..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Button onClick={handleSaveAll} className="w-full bg-blue-500 hover:bg-blue-600 shadow-none">
                <Save className="w-4 h-4 mr-2" />
                Save Attendance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => {
                  const attendance = getAttendance(employee.employeeId);
                  return (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.employeeId}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>
                        <Select
                          value={attendance?.status || 'Present'}
                          onValueChange={(value: 'Present' | 'Absent' | 'Half Day' | 'Late') =>
                            handleStatusChange(employee.employeeId, value)
                          }
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Present">Present</SelectItem>
                            <SelectItem value="Absent">Absent</SelectItem>
                            <SelectItem value="Half Day">Half Day</SelectItem>
                            <SelectItem value="Late">Late</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={attendance?.clockIn || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleClockInChange(employee.employeeId, e.target.value)
                          }
                          className="w-[120px]"
                          disabled={attendance?.status === 'Absent'}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="time"
                          value={attendance?.clockOut || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleClockOutChange(employee.employeeId, e.target.value)
                          }
                          className="w-[120px]"
                          disabled={attendance?.status === 'Absent'}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600">
                  {attendanceRecords.filter((a) => a.date === selectedDate && a.status === 'Present').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">
                  {attendanceRecords.filter((a) => a.date === selectedDate && a.status === 'Absent').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Late</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {attendanceRecords.filter((a) => a.date === selectedDate && a.status === 'Late').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Half Day</p>
                <p className="text-2xl font-bold text-blue-600">
                  {attendanceRecords.filter((a) => a.date === selectedDate && a.status === 'Half Day').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
