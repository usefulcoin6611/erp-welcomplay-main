'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import type { LeadReportItem } from './constants'

interface LeadTableProps {
  data: LeadReportItem[]
  isLoading: boolean
}

const statusColorMap: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-green-100 text-green-800',
  converted: 'bg-purple-100 text-purple-800',
  lost: 'bg-red-100 text-red-800',
}

export function LeadTable({ data, isLoading }: LeadTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Tidak ada data untuk ditampilkan
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">ID Lead</TableHead>
              <TableHead className="font-semibold">Nama</TableHead>
              <TableHead className="font-semibold">Perusahaan</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Telepon</TableHead>
              <TableHead className="font-semibold">Sumber</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Nilai Est.</TableHead>
              <TableHead className="font-semibold">Tgl. Dibuat</TableHead>
              <TableHead className="font-semibold">PIC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.leadId}>
                <TableCell>
                  <Link
                    href={`/crm/leads/${item.leadId}`}
                    className="text-blue-500 hover:text-blue-600 hover:underline font-medium"
                  >
                    {item.leadId}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.company}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.phone}</TableCell>
                <TableCell>{item.source}</TableCell>
                <TableCell>
                  <Badge className={statusColorMap[item.status] || 'bg-gray-100 text-gray-800'}>
                    {item.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">{item.estimatedValue}</TableCell>
                <TableCell>{item.createdDate}</TableCell>
                <TableCell>{item.assignedTo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
