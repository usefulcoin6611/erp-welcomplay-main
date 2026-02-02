'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Pencil } from 'lucide-react'
import type { Trainer } from '@/lib/training-data'

const cardClass = 'rounded-lg border shadow-[0_1px_2px_0_rgba(0,0,0,0.04)]'

type TrainerDetailClientProps = {
  trainer: Trainer
}

export function TrainerDetailClient({ trainer }: TrainerDetailClientProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card className={cardClass}>
        <CardContent className="px-4 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">{trainer.firstName} {trainer.lastName}</h1>
              <p className="text-sm text-muted-foreground">
                {trainer.branch} · {trainer.email}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 px-3 shadow-none bg-sky-100 text-sky-800 hover:bg-sky-200 border-sky-200"
                title="Edit"
              >
                <Link href={`/hrm/training?tab=trainer&edit=${trainer.id}`}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="h-8 px-3 shadow-none bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
              >
                <Link href="/hrm/training?tab=trainer">
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Kembali ke Daftar Trainer
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardHeader className="pb-2 px-4 py-3">
          <CardTitle className="text-sm font-medium">Detail Trainer</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-3 text-sm">
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Branch</span>
            <span className="font-medium">{trainer.branch}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Nama Lengkap</span>
            <span className="font-medium">{trainer.firstName} {trainer.lastName}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Kontak</span>
            <span className="font-medium">{trainer.contact}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{trainer.email}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-muted-foreground">Keahlian</span>
            <span className="font-medium">{trainer.expertise}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
