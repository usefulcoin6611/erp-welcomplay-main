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

  const handleSetSalary = (employeeId: string) => {
    console.log('Set salary for employee:', employeeId);
    // TODO: Open modal or navigate to set salary page
  };

  const handleViewDetails = (employeeId: string) => {
    console.log('View details for employee:', employeeId);
    // TODO: Open modal with salary details
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, employee ID, or department..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Payroll Type</TableHead>
                <TableHead className="text-right">Base Salary</TableHead>
                <TableHead className="text-right">Allowances</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-primary"
                        onClick={() => handleViewDetails(employee.id)}
                      >
                        {employee.employeeId}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{employee.payrollType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(employee.salary)}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(employee.allowances)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(employee.deductions)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(employee.netSalary)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(employee.id)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSetSalary(employee.id)}
                          title="Set Salary"
                          className="bg-blue-500 hover:bg-blue-600 shadow-none"
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
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
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
        <Card>
          <CardContent className="pt-6">
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
        <Card>
          <CardContent className="pt-6">
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
    </div>
  );
}
