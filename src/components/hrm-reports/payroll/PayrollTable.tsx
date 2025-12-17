'use client';

import { memo } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PayrollData } from './constants';

interface PayrollTableProps {
  data: PayrollData[];
}

function PayrollTable({ data }: PayrollTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Employee ID</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead className="text-right">Basic Salary</TableHead>
              <TableHead className="text-right">Allowances</TableHead>
              <TableHead className="text-right">Deductions</TableHead>
              <TableHead className="text-right">Net Salary</TableHead>
              <TableHead>Payment Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  No payroll data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link href={`/hrm/employees/${item.employeeId}`} className="text-blue-500 hover:text-blue-600 hover:underline">
                      {item.employeeId}
                    </Link>
                  </TableCell>
                  <TableCell>{item.employeeName}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>{item.branch}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.basicSalary)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.allowances)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.deductions)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(item.netSalary)}</TableCell>
                  <TableCell>{formatDate(item.paymentDate)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default memo(PayrollTable);
