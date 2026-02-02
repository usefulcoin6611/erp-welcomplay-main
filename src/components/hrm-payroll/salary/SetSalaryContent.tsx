'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, Calculator } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  payrollType: string;
  salary: number;
  netSalary: number;
  allowances: number;
  deductions: number;
  department: string;
}

export function SetSalaryContent() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - sesuai dengan struktur Laravel reference
  const [employees] = useState<Employee[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      name: 'John Doe',
      payrollType: 'Monthly',
      salary: 8000000,
      allowances: 1500000,
      deductions: 500000,
      netSalary: 9000000,
      department: 'IT',
    },
    {
      id: '2',
      employeeId: 'EMP002',
      name: 'Jane Smith',
      payrollType: 'Monthly',
      salary: 7500000,
      allowances: 1200000,
      deductions: 400000,
      netSalary: 8300000,
      department: 'HR',
    },
    {
      id: '3',
      employeeId: 'EMP003',
      name: 'Bob Johnson',
      payrollType: 'Monthly',
      salary: 9000000,
      allowances: 2000000,
      deductions: 600000,
      netSalary: 10400000,
      department: 'Finance',
    },
    {
      id: '4',
      employeeId: 'EMP004',
      name: 'Alice Brown',
      payrollType: 'Hourly',
      salary: 6000000,
      allowances: 800000,
      deductions: 300000,
      netSalary: 6500000,
      department: 'Marketing',
    },
  ]);

  const filteredData = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSetSalary = (id: string) => {
    router.push(`/hrm/payroll/set-salary/${id}/edit`);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/hrm/payroll/set-salary/${id}`);
  };

  const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

  return (
    <div className="space-y-4">
      {/* Summary Statistics - placement seragam dengan Leave/Performance/Training */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <Calculator className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Base Salary</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(employees.reduce((sum, emp) => sum + emp.salary, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Allowances</p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(employees.reduce((sum, emp) => sum + emp.allowances, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Net Salary</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    notation: 'compact',
                  }).format(employees.reduce((sum, emp) => sum + emp.netSalary, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List - search menyatu dengan table, kanan atas */}
      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between gap-4 px-4 py-3 border-b">
          <CardTitle className="text-base font-medium">Set Salary</CardTitle>
          <div className="relative w-56 shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search name, ID, department..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="h-9 border-0 bg-gray-50 pl-9 pr-3 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0 w-full"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 font-medium">Employee ID</TableHead>
                <TableHead className="px-4 py-3 font-medium">Name</TableHead>
                <TableHead className="px-4 py-3 font-medium">Department</TableHead>
                <TableHead className="px-4 py-3 font-medium">Payroll Type</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">Base Salary</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">Allowances</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">Deductions</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">Net Salary</TableHead>
                <TableHead className="px-4 py-3 font-medium text-center w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="px-4 py-3">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-primary"
                        onClick={() => handleViewDetails(employee.id)}
                      >
                        {employee.employeeId}
                      </Button>
                    </TableCell>
                    <TableCell className="px-4 py-3 font-medium">{employee.name}</TableCell>
                    <TableCell className="px-4 py-3">{employee.department}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant="outline">{employee.payrollType}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(employee.salary)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-green-600">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(employee.allowances)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right text-red-600">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(employee.deductions)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-semibold">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(employee.netSalary)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(employee.id)}
                          title="View Details"
                          className="h-7 shadow-none bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetSalary(employee.id)}
                          title="Set Salary"
                          className="h-7 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                        >
                          <Calculator className="w-4 h-4 mr-1" />
                          Set Salary
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
