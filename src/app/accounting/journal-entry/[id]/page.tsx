'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface JournalLine {
  id: string
  accountId: string
  account: {
    code: string
    name: string
  }
  description: string | null
  debit: number
  credit: number
}

interface JournalEntry {
  id: string
  journalId: string
  date: string
  reference: string | null
  description: string | null
  amount: number
  lines: JournalLine[]
}

export default function JournalEntryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [journal, setJournal] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const response = await fetch(`/api/journal-entries/${id}`)
        const data = await response.json()
        if (data.success) {
          setJournal(data.data)
        }
      } catch (error) {
        console.error('Error fetching journal detail:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchJournal()
  }, [id])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!journal) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Journal Entry not found</p>
      </div>
    )
  }

  const totalDebit = journal.lines.reduce((sum, line) => sum + line.debit, 0)
  const totalCredit = journal.lines.reduce((sum, line) => sum + line.credit, 0)

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-4 p-6 bg-gray-50">
            {/* Breadcrumb & Header - reference-erp style */}
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
                <span>/</span>
                <Link href="/accounting/double-entry?tab=journal-entry" className="hover:text-foreground">Journal Entry</Link>
                <span>/</span>
                <span className="text-foreground">{journal.journalId}</span>
              </div>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Journal Detail</h1>
                <Button variant="outline" size="sm" className="bg-white" onClick={() => router.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </div>
            </div>

            <Card className="shadow-sm border-0 bg-white">
              <CardContent className="p-8">
                {/* Journal Header Info */}
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold">Journal</h2>
                    <h3 className="text-xl font-semibold text-muted-foreground">{journal.journalId}</h3>
                  </div>
                  
                  <hr className="border-gray-100" />

                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-sm font-bold mb-1">To :</div>
                      <div className="text-sm text-muted-foreground">
                        Welcomplay ERP<br />
                        (021) 12345678<br />
                        Jl. Sudirman No. 123<br />
                        Jakarta Selatan, DKI Jakarta, Indonesia.
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm">
                        <span className="font-bold">Journal No : </span>
                        <span>{journal.journalId}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-bold">Journal Ref : </span>
                        <span>{journal.reference || '-'}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-bold">Journal Date : </span>
                        <span>{new Date(journal.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Account Summary Table */}
                  <div className="mt-4">
                    <div className="font-bold mb-4">Journal Account Summary</div>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            <TableHead className="w-12 text-foreground font-bold">#</TableHead>
                            <TableHead className="text-foreground font-bold">Account</TableHead>
                            <TableHead className="w-1/4 text-foreground font-bold">Description</TableHead>
                            <TableHead className="text-foreground font-bold">Debit</TableHead>
                            <TableHead className="text-foreground font-bold">Credit</TableHead>
                            <TableHead className="text-foreground font-bold">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {journal.lines.map((line, index) => (
                            <TableRow key={line.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{line.account.code} - {line.account.name}</TableCell>
                              <TableCell className="text-muted-foreground">{line.description || '-'}</TableCell>
                              <TableCell>{formatPrice(line.debit)}</TableCell>
                              <TableCell>{formatPrice(line.credit)}</TableCell>
                              <TableCell>
                                {line.debit > 0 ? formatPrice(line.debit) : formatPrice(line.credit)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Totals & Description */}
                  <div className="flex flex-col gap-4 mt-2">
                    <div className="flex justify-end gap-24 pr-12">
                      <div className="space-y-2">
                        <div className="font-bold">Total Debit</div>
                        <div className="font-bold">Total Credit</div>
                      </div>
                      <div className="space-y-2 text-right">
                        <div>{formatPrice(totalDebit)}</div>
                        <div>{formatPrice(totalCredit)}</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="font-bold mb-1">Description :</div>
                      <div className="text-sm text-muted-foreground italic">
                        {journal.description || 'No description provided.'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
