'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft } from 'lucide-react'
import { TRAINING_STATUS_OPTIONS, TRAINING_PERFORMANCE_OPTIONS } from '@/lib/training-data'

type Training = {
  id: string
  branch: string
  trainerOption: string
  trainingType: string
  employee: string
  trainer: string
  status: string
  startDate: string
  endDate: string
  cost: number
  description?: string | null
  performance?: string | null
  remarks?: string | null
  createdAt?: string | null
}

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

type TrainingDetailClientProps = {
  training: Training
}

/** Layout sesuai reference-erp resources/views/training/show.blade.php */
export function TrainingDetailClient({ training }: TrainingDetailClientProps) {
  const [performance, setPerformance] = useState('Not Concluded')
  const [status, setStatus] = useState(training.status)
  const [remarks, setRemarks] = useState('')

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API update training status
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header: Back button di kanan */}
      <div className="flex items-center justify-end">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 px-3 shadow-none bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
        >
          <Link href="/hrm/training">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Kembali ke Training
          </Link>
        </Button>
      </div>

      {/* Row: kiri 1/3, kanan 2/3 - reference-erp show.blade.php */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left card: table + description */}
        <div className="lg:col-span-1">
          <Card className={cardClass}>
            <CardContent className="px-4 py-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium px-0 pt-0 pb-3">{'Training Type'}</TableCell>
                    <TableCell className="text-end px-0 pt-0 pb-3">{training.trainingType}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium px-0 py-3">{'Trainer'}</TableCell>
                    <TableCell className="text-end px-0 py-3">{training.trainer}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium px-0 py-3">{'Training Cost'}</TableCell>
                    <TableCell className="text-end px-0 py-3">
                      Rp {training.cost.toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium px-0 py-3">{'Start Date'}</TableCell>
                    <TableCell className="text-end px-0 py-3">{training.startDate}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium px-0 py-3">{'End Date'}</TableCell>
                    <TableCell className="text-end px-0 py-3">{training.endDate}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium px-0 pt-3 pb-0">{'Date'}</TableCell>
                    <TableCell className="text-end px-0 pt-3 pb-0">
                      {training.createdAt ?? training.startDate}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {training.description && (
                <p className="text-sm text-muted-foreground pt-4 mt-4 border-t border-border">
                  {training.description}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right card: Training Employee + Update Status form */}
        <div className="lg:col-span-2">
          <Card className={cardClass}>
            <CardContent className="px-4 py-4">
              {/* Training Employee */}
              <h6 className="text-sm font-semibold mb-3">{'Training Employee'}</h6>
              <hr className="mb-4 border-border" />
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="h-12 w-12 border-2 border-primary">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                    {training.employee
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href="/hrm/employees"
                    className="font-medium text-foreground hover:underline"
                  >
                    {training.employee}
                  </Link>
                  <p className="text-xs text-muted-foreground">Employee</p>
                </div>
              </div>

              {/* Update Status form */}
              <form onSubmit={handleUpdateStatus}>
                <h6 className="text-sm font-semibold mb-3">{'Update Status'}</h6>
                <hr className="mb-4 border-border" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="performance">{'Performance'}</Label>
                    <Select value={performance} onValueChange={setPerformance}>
                      <SelectTrigger id="performance" className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRAINING_PERFORMANCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">{'Status'}</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status" className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRAINING_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Label htmlFor="remarks">{'Remarks'}</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Remarks"
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="resize-none"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 shadow-none">
                    {'Save'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
