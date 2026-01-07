import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  IconCalendar,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'

const journalEntries = [
  {
    id: 'JR-2025-001',
    date: '2025-11-01',
    reference: 'Opening Balance',
    description: 'Opening balances for all accounts',
    debit: 500_000_000,
    credit: 500_000_000,
  },
  {
    id: 'JR-2025-002',
    date: '2025-11-03',
    reference: 'Manual Adjustment',
    description: 'Reclassification of expense',
    debit: 7_500_000,
    credit: 7_500_000,
  },
] as const

export default function JournalEntryPage() {
  const totalEntries = journalEntries.length

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
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Journal Entries</h1>
              </div>
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                <IconPlus className="mr-2 h-4 w-4" />
                Create Journal
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalEntries}</div>
                  <p className="text-xs text-muted-foreground">
                    Jurnal yang tercatat
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Cari jurnal berdasarkan tanggal, referensi, atau deskripsi.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="flex-1 min-w-0">
                    <label className="mb-1 block text-sm font-medium">
                      Search
                    </label>
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Input
                        placeholder="Cari nomor jurnal atau deskripsi..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-44">
                    <label className="mb-1 block text-sm font-medium">
                      Date
                    </label>
                    <Input type="date" />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Journal List</CardTitle>
                <CardDescription>
                  Ringkasan jurnal umum, total debit dan kredit harus seimbang.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Journal</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Total Debit</TableHead>
                      <TableHead className="text-right">Total Credit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="text-sm font-semibold">
                            {entry.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <IconCalendar className="h-3 w-3" />
                            <span>{entry.date}</span>
                          </div>
                        </TableCell>
                        <TableCell>{entry.reference}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {entry.description}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">
                            Rp {entry.debit.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">
                            Rp {entry.credit.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-50 text-blue-700 border-none">
                            Detail
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

