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
          <div className="@container/main flex flex-1 flex-col gap-4 p-4 bg-gray-100">
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
                <CardHeader className="px-6 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Entries
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="text-2xl font-bold">{totalEntries}</div>
                  <p className="text-xs text-muted-foreground">
                    Jurnal yang tercatat
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
              <CardHeader className="px-6">
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Cari jurnal berdasarkan tanggal, referensi, atau deskripsi.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 py-4">
                <form className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[1fr_14rem] md:justify-start">
                  <div className="min-w-0">
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
                  <div className="space-y-2">
                    <label className="mb-1 block text-sm font-medium">
                      Date
                    </label>
                    <Input type="date" className="h-9" />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
              <CardHeader className="px-6">
                <CardTitle>Journal List</CardTitle>
                <CardDescription>
                  Ringkasan jurnal umum, total debit dan kredit harus seimbang.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-6">Journal</TableHead>
                      <TableHead className="px-6">Date</TableHead>
                      <TableHead className="px-6">Reference</TableHead>
                      <TableHead className="px-6">Description</TableHead>
                      <TableHead className="px-6 text-right">Total Debit</TableHead>
                      <TableHead className="px-6 text-right">Total Credit</TableHead>
                      <TableHead className="px-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {journalEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="px-6">
                          <div className="text-sm font-semibold">
                            {entry.id}
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="flex items-center gap-1 text-sm">
                            <IconCalendar className="h-3 w-3" />
                            <span>{entry.date}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6">{entry.reference}</TableCell>
                        <TableCell className="px-6">
                          <span className="text-sm text-muted-foreground">
                            {entry.description}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          <div className="font-medium">
                            Rp {entry.debit.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          <div className="font-medium">
                            Rp {entry.credit.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
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

