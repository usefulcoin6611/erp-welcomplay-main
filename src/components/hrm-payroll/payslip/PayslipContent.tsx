'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Search, FileText, Eye, Edit, Trash2, Download, Send, DollarSign, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Payslip {
  id: string;
  employeeId: string;
  employeeName?: string;
  employee?: { name: string; employeeId: string; salaryType: string };
  payrollType?: string;
  salary: number; // basicSalary
  netSalary: number;
  status: string; // "Paid" | "UnPaid"
}

export function PayslipContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [payslipToDelete, setPayslipToDelete] = useState<string | null>(null);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        month: `${filterYear}-${String(filterMonth).padStart(2, '0')}`,
      });
      const response = await fetch(`/api/hrm/payroll/payslip?${query}`);
      const data = await response.json();
      if (data.success) {
        // Map API data to component interface
        const mappedData = data.data.map((item: any) => ({
          id: item.id,
          employeeId: item.employee.employeeId,
          employeeName: item.employee.name,
          payrollType: item.employee.salaryType || 'Monthly',
          salary: item.basicSalary,
          netSalary: item.netSalary,
          status: item.status === 1 ? 'Paid' : 'UnPaid',
        }));
        setPayslips(mappedData);
      } else {
        toast.error(data.message || 'Failed to fetch payslips');
      }
    } catch (error) {
      console.error('Error fetching payslips:', error);
      toast.error('Failed to fetch payslips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, [filterMonth, filterYear]);

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

  const handleGeneratePayslip = async () => {
    try {
      const response = await fetch('/api/hrm/payroll/payslip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        // If generated for current filter, refresh
        if (selectedMonth === filterMonth && selectedYear === filterYear) {
          fetchPayslips();
        }
      } else {
        toast.error(data.message || 'Failed to generate payslips');
      }
    } catch (error) {
      console.error('Error generating payslips:', error);
      toast.error('Failed to generate payslips');
    }
  };

  const handleBulkPayment = async () => {
    try {
      const salaryMonth = `${filterYear}-${String(filterMonth).padStart(2, '0')}`;
      const res = await fetch('/api/hrm/payroll/payslip/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salaryMonth }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Bulk payment failed');
        return;
      }
      toast.success(data.message || 'Bulk payment succeeded');
      fetchPayslips();
    } catch (error) {
      console.error('Error in bulk payment:', error);
      toast.error('Bulk payment failed');
    }
  };

  const handleExport = () => {
    toast.info('Export feature coming soon');
  };

  const handleViewPayslip = (id: string) => {
    router.push(`/hrm/payroll/payslip/${id}`);
  };

  const handleClickToPaid = async (id: string) => {
    try {
      const response = await fetch(`/api/hrm/payroll/payslip/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 1 }), // Paid
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Payslip marked as Paid');
        fetchPayslips();
      } else {
        toast.error(data.message || 'Failed to update payslip');
      }
    } catch (error) {
      console.error('Error updating payslip:', error);
      toast.error('Failed to update payslip');
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/hrm/payroll/payslip/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    setPayslipToDelete(id);
    setDeleteAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (payslipToDelete) {
      try {
        const response = await fetch(`/api/hrm/payroll/payslip/${payslipToDelete}`, {
          method: 'DELETE',
        });
        const data = await response.json();
        if (data.success) {
          toast.success('Payslip deleted successfully');
          fetchPayslips();
        } else {
          toast.error(data.message || 'Failed to delete payslip');
        }
      } catch (error) {
        console.error('Error deleting payslip:', error);
        toast.error('Failed to delete payslip');
      } finally {
        setPayslipToDelete(null);
        setDeleteAlertOpen(false);
      }
    }
  };

  const filteredData = payslips.filter(
    (payslip) =>
      (payslip.employeeName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (payslip.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]';

  return (
    <div className="space-y-4">
      {/* Summary Cards - placement seragam dengan Leave/Performance/Training */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Payslips</p>
                <p className="text-2xl font-bold">{payslips.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
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
        <Card className={cardClass}>
          <CardContent className="px-4 py-4">
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

      {/* Generate Payslip */}
      <Card className={cardClass}>
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-base font-medium">Generate Payslip</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2 min-w-[140px]">
              <Label className="text-sm">Month</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="h-9 w-full">
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
            <div className="space-y-2 min-w-[100px]">
              <Label className="text-sm">Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="h-9 w-full">
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
            <Button onClick={handleGeneratePayslip} className="h-9 bg-blue-500 hover:bg-blue-600 shadow-none">
              <FileText className="w-4 h-4 mr-2" />
              Generate Payslip
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Find Employee Payslip - search menyatu dengan table, kanan atas */}
      <Card className={cardClass}>
        <CardHeader className="flex flex-row items-center justify-between gap-4 px-4 py-3 border-b">
          <CardTitle className="text-base font-medium">Find Employee Payslip</CardTitle>
          <div className="relative w-56 shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name or employee ID..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="h-9 border-0 bg-gray-50 pl-9 pr-3 shadow-none transition-colors hover:bg-gray-100 focus-visible:ring-0 w-full"
            />
          </div>
        </CardHeader>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b">
          <Label className="text-sm text-muted-foreground shrink-0">Month</Label>
          <Select value={filterMonth.toString()} onValueChange={(value) => setFilterMonth(parseInt(value))}>
            <SelectTrigger className="w-36 h-9">
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
          <Label className="text-sm text-muted-foreground shrink-0">Year</Label>
          <Select value={filterYear.toString()} onValueChange={(value) => setFilterYear(parseInt(value))}>
            <SelectTrigger className="w-24 h-9">
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
          <Button variant="outline" size="sm" onClick={handleExport} className="h-9 shadow-none">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={handleBulkPayment} className="h-9 bg-blue-500 hover:bg-blue-600 shadow-none">
            <Send className="w-4 h-4 mr-2" />
            Bulk Payment
          </Button>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4 py-3 font-medium">Employee ID</TableHead>
                <TableHead className="px-4 py-3 font-medium">Name</TableHead>
                <TableHead className="px-4 py-3 font-medium">Payroll Type</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">Salary</TableHead>
                <TableHead className="px-4 py-3 font-medium text-right">Net Salary</TableHead>
                <TableHead className="px-4 py-3 font-medium text-center">Status</TableHead>
                <TableHead className="px-4 py-3 font-medium text-center w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No payslips found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="px-4 py-3 font-medium">{payslip.employeeId}</TableCell>
                    <TableCell className="px-4 py-3">{payslip.employeeName}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge variant="outline">{payslip.payrollType}</Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(payslip.salary)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-semibold">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(payslip.netSalary)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Badge className={payslip.status === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}>
                        {payslip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewPayslip(payslip.id)}
                          title="View Payslip"
                          className="h-7 w-7 p-0 shadow-none bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {payslip.status === 'UnPaid' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleClickToPaid(payslip.id)}
                              title="Click to Paid"
                              className="h-7 w-7 p-0 shadow-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100"
                            >
                              <DollarSign className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(payslip.id)}
                              title="Edit"
                              className="h-7 w-7 p-0 shadow-none bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClick(payslip.id)}
                          title="Delete"
                          className="h-7 w-7 p-0 shadow-none bg-red-50 text-red-700 hover:bg-red-100 border-red-100"
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
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Payslip?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Payslip akan dihapus secara permanen.
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
