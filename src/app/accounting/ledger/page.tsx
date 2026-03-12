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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  IconSearch,
} from '@tabler/icons-react'

const ledgerRows = [
  {
    id: 1,
    date: '2025-11-01',
    journal: 'JR-2025-001',
    description: 'Opening Balance',
    debit: 250_000_000,
    credit: 0,
    balance: 250_000_000,
  },
  {
    id: 2,
    date: '2025-11-03',
    journal: 'JR-2025-002',
    description: 'Manual Adjustment',
    debit: 0,
    credit: 7_500_000,
    balance: 242_500_000,
  },
] as const

export default function LedgerPage() {
  const totalDebit = ledgerRows.reduce((sum, r) => sum + r.debit, 0)
  const totalCredit = ledgerRows.reduce((sum, r) => sum + r.credit, 0)
  const endingBalance =
    ledgerRows.length > 0
      ? ledgerRows[ledgerRows.length - 1].balance
      : 0

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
                <h1 className="text-3xl font-bold">Ledger Summary</h1>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-none">
                Sample Data
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="px-6 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Debit
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="text-2xl font-bold">
                    Rp {totalDebit.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="px-6 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Credit
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="text-2xl font-bold">
                    Rp {totalCredit.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="px-6 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ending Balance
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="text-2xl font-bold">
                    Rp {endingBalance.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
              <CardHeader className="px-6">
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Pilih akun dan periode untuk melihat ledger.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 py-4">
                <form className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[1fr_14rem_14rem_14rem] md:justify-start">
                  <div className="min-w-0 space-y-2">
                    <label className="mb-1 block text-sm font-medium">
                      Search
                    </label>
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Input
                        placeholder="Cari deskripsi jurnal..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="mb-1 block text-sm font-medium">
                      Account
                    </label>
                    <Select defaultValue="1000">
                      <SelectTrigger className="w-full h-9 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1000">
                          1000 - Cash &amp; Bank
                        </SelectItem>
                        <SelectItem value="1100">
                          1100 - Accounts Receivable
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="mb-1 block text-sm font-medium">
                      Start Date
                    </label>
                    <Input type="date" className="h-9" />
                  </div>
                  <div className="space-y-2">
                    <label className="mb-1 block text-sm font-medium">
                      End Date
                    </label>
                    <Input type="date" className="h-9" />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
              <CardHeader className="px-6">
                <CardTitle>Ledger Detail</CardTitle>
                <CardDescription>
                  Daftar transaksi debit / kredit untuk akun terpilih.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-6">Date</TableHead>
                      <TableHead className="px-6">Journal</TableHead>
                      <TableHead className="px-6">Description</TableHead>
                      <TableHead className="px-6 text-right">Debit</TableHead>
                      <TableHead className="px-6 text-right">Credit</TableHead>
                      <TableHead className="px-6 text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="px-6">
                          <div className="flex items-center gap-1 text-sm">
                            <IconCalendar className="h-3 w-3" />
                            <span>{row.date}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6">{row.journal}</TableCell>
                        <TableCell className="px-6">
                          <span className="text-sm text-muted-foreground">
                            {row.description}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          {row.debit
                            ? `Rp ${row.debit.toLocaleString()}`
                            : '-'}
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          {row.credit
                            ? `Rp ${row.credit.toLocaleString()}`
                            : '-'}
                        </TableCell>
                        <TableCell className="px-6 text-right font-medium">
                          Rp {row.balance.toLocaleString()}
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

