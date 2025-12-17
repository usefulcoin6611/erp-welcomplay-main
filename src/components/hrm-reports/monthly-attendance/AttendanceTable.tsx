'use client';

import { memo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { AttendanceData } from './constants';

interface AttendanceTableProps {
  data: AttendanceData[];
  dates: string[];
}

function AttendanceTable({ data, dates }: AttendanceTableProps) {
  const getStatusBadge = (status: 'P' | 'A' | 'L' | undefined) => {
    if (!status) return <span className="text-muted-foreground text-xs">-</span>;
    
    switch (status) {
      case 'P':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs px-2">P</Badge>;
      case 'A':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs px-2">A</Badge>;
      case 'L':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs px-2">L</Badge>;
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card z-10 min-w-[150px]">Employee Name</TableHead>
              {dates.map((date) => (
                <TableHead key={date} className="text-center min-w-[60px]">
                  {date}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={dates.length + 1} className="text-center text-muted-foreground py-8">
                  No attendance data found
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.employeeId}>
                  <TableCell className="sticky left-0 bg-card z-10 font-medium">
                    {item.employeeName}
                  </TableCell>
                  {dates.map((date) => (
                    <TableCell key={date} className="text-center">
                      {getStatusBadge(item.attendance[date])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default memo(AttendanceTable);
