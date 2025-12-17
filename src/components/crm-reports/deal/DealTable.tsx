'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import type { DealReportItem } from './constants'

interface DealTableProps {
  data: DealReportItem[]
  isLoading: boolean
}

const stageColorMap: Record<string, string> = {
  prospecting: 'bg-blue-100 text-blue-800',
  qualification: 'bg-yellow-100 text-yellow-800',
  proposal: 'bg-orange-100 text-orange-800',
  negotiation: 'bg-purple-100 text-purple-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
}

const priorityColorMap: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

export function DealTable({ data, isLoading }: DealTableProps) {
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
              <TableHead className="font-semibold">ID Deal</TableHead>
              <TableHead className="font-semibold">Nama Deal</TableHead>
              <TableHead className="font-semibold">Perusahaan</TableHead>
              <TableHead className="font-semibold">Kontak</TableHead>
              <TableHead className="font-semibold">Tahapan</TableHead>
              <TableHead className="font-semibold">Prioritas</TableHead>
              <TableHead className="font-semibold">Nilai Deal</TableHead>
              <TableHead className="font-semibold">Prob. Closing</TableHead>
              <TableHead className="font-semibold">Tgl. Closing</TableHead>
              <TableHead className="font-semibold">PIC</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.dealId}>
                <TableCell>
                  <Link
                    href={`/crm/deals/${item.dealId}`}
                    className="text-blue-500 hover:text-blue-600 hover:underline font-medium"
                  >
                    {item.dealId}
                  </Link>
                </TableCell>
                <TableCell className="font-medium">{item.dealName}</TableCell>
                <TableCell>{item.company}</TableCell>
                <TableCell>{item.contact}</TableCell>
                <TableCell>
                  <Badge className={stageColorMap[item.stage] || 'bg-gray-100 text-gray-800'}>
                    {item.stageLabel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={priorityColorMap[item.priority] || 'bg-gray-100 text-gray-800'}>
                    {item.priorityLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">{item.dealValue}</TableCell>
                <TableCell className="text-center">{item.probability}</TableCell>
                <TableCell>{item.expectedCloseDate}</TableCell>
                <TableCell>{item.assignedTo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
