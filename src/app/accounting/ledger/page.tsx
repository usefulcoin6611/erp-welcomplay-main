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
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Debit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalDebit.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Credit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {totalCredit.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Ending Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rp {endingBalance.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Pilih akun dan periode untuk melihat ledger.
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
                        placeholder="Cari deskripsi jurnal..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-52">
                    <label className="mb-1 block text-sm font-medium">
                      Account
                    </label>
                    <Select defaultValue="1000">
                      <SelectTrigger>
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
                  <div className="w-full md:w-40">
                    <label className="mb-1 block text-sm font-medium">
                      Start Date
                    </label>
                    <Input type="date" />
                  </div>
                  <div className="w-full md:w-40">
                    <label className="mb-1 block text-sm font-medium">
                      End Date
                    </label>
                    <Input type="date" />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ledger Detail</CardTitle>
                <CardDescription>
                  Daftar transaksi debit / kredit untuk akun terpilih.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Journal</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ledgerRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <IconCalendar className="h-3 w-3" />
                            <span>{row.date}</span>
                          </div>
                        </TableCell>
                        <TableCell>{row.journal}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {row.description}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {row.debit
                            ? `Rp ${row.debit.toLocaleString()}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.credit
                            ? `Rp ${row.credit.toLocaleString()}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
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

