'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, FileText, Eye, Edit, Trash2, Download, Send, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Payslip {
  id: string;
  employeeId: string;
  employeeName: string;
  payrollType: string;
  salary: number;
  netSalary: number;
  status: 'Paid' | 'UnPaid';
  month: string;
  year: string;
}

export function PayslipContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Mock data - sesuai dengan struktur Laravel reference
  const [payslips, setPayslips] = useState<Payslip[]>([
    {
      id: '1',
      employeeId: 'EMP001',
      employeeName: 'John Doe',
      payrollType: 'Monthly',
      salary: 8000000,
      netSalary: 9000000,
      status: 'Paid',
      month: '03',
      year: '2024',
    },
    {
      id: '2',
      employeeId: 'EMP002',
      employeeName: 'Jane Smith',
      payrollType: 'Monthly',
      salary: 7500000,
      netSalary: 8300000,
      status: 'UnPaid',
      month: '03',
      year: '2024',
    },
    {
      id: '3',
      employeeId: 'EMP003',
      employeeName: 'Bob Johnson',
      payrollType: 'Monthly',
      salary: 9000000,
      netSalary: 10400000,
      status: 'Paid',
      month: '03',
      year: '2024',
    },
    {
      id: '4',
      employeeId: 'EMP004',
      employeeName: 'Alice Brown',
      payrollType: 'Hourly',
      salary: 6000000,
      netSalary: 6500000,
      status: 'UnPaid',
      month: '03',
      year: '2024',
    },
  ]);

  const handleGeneratePayslip = () => {
    console.log('Generate payslip for:', selectedMonth, selectedYear);
    // TODO: Implement payslip generation logic
    alert(`Generating payslip for ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`);
  };

  const handleBulkPayment = () => {
    console.log('Bulk payment for:', filterMonth, filterYear);
    // TODO: Implement bulk payment logic
  };

  const handleExport = () => {
    console.log('Export payslips for:', filterMonth, filterYear);
    // TODO: Implement export logic
  };

  const handleViewPayslip = (id: string) => {
    console.log('View payslip:', id);
    // TODO: Open payslip PDF modal
  };

  const handleClickToPaid = (id: string) => {
    setPayslips(payslips.map(p => p.id === id ? { ...p, status: 'Paid' as const } : p));
  };

  const handleEdit = (id: string) => {
    console.log('Edit payslip:', id);
    // TODO: Open edit modal
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payslip?')) {
      setPayslips(payslips.filter(p => p.id !== id));
    }
  };

  const filteredData = payslips.filter(
    (payslip) =>
      payslip.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payslip.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Generate Payslip */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Generate Payslip</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label>Select Month</Label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Year</Label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button onClick={handleGeneratePayslip} className="w-full bg-blue-500 hover:bg-blue-600 shadow-none">
                <FileText className="w-4 h-4 mr-2" />
                Generate Payslip
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Find Employee Payslip */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Find Employee Payslip</h3>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end mb-6">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name or employee ID..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Month</Label>
              <Select
                value={filterMonth.toString()}
                onValueChange={(value) => setFilterMonth(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select
                value={filterYear.toString()}
                onValueChange={(value) => setFilterYear(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" onClick={handleExport} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            <div>
              <Button onClick={handleBulkPayment} className="w-full bg-blue-500 hover:bg-blue-600 shadow-none">
                <Send className="w-4 h-4 mr-2" />
                Bulk Payment
              </Button>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Payroll Type</TableHead>
                <TableHead className="text-right">Salary</TableHead>
                <TableHead className="text-right">Net Salary</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No payslips found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-medium">{payslip.employeeId}</TableCell>
                    <TableCell>{payslip.employeeName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payslip.payrollType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(payslip.salary)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(payslip.netSalary)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={payslip.status === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}>
                        {payslip.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPayslip(payslip.id)}
                          title="View Payslip"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {payslip.status === 'UnPaid' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleClickToPaid(payslip.id)}
                              title="Click to Paid"
                              className="bg-blue-500 hover:bg-blue-600 shadow-none"
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(payslip.id)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(payslip.id)}
                          title="Delete"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payslips</p>
                <p className="text-2xl font-bold">{payslips.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  {payslips.filter((p) => p.status === 'Paid').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unpaid</p>
                <p className="text-2xl font-bold text-red-600">
                  {payslips.filter((p) => p.status === 'UnPaid').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
