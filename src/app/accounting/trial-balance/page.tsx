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
  IconDownload,
  IconScale,
} from '@tabler/icons-react'

const trialRows = [
  {
    code: '1000',
    name: 'Cash & Bank',
    debit: 250_000_000,
    credit: 0,
  },
  {
    code: '1100',
    name: 'Accounts Receivable',
    debit: 125_000_000,
    credit: 0,
  },
  {
    code: '2000',
    name: 'Accounts Payable',
    debit: 0,
    credit: 75_000_000,
  },
  {
    code: '3000',
    name: 'Owner Equity',
    debit: 0,
    credit: 300_000_000,
  },
] as const

const totalDebit = trialRows.reduce((sum, r) => sum + r.debit, 0)
const totalCredit = trialRows.reduce((sum, r) => sum + r.credit, 0)

export default function TrialBalancePage() {
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
                <h1 className="text-3xl font-bold">Trial Balance</h1>
              </div>
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                <IconDownload className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Pilih periode trial balance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4 md:flex-row md:items-end">
                  <div className="w-full md:w-44">
                    <label className="mb-1 block text-sm font-medium">
                      Start Date
                    </label>
                    <Input type="date" />
                  </div>
                  <div className="w-full md:w-44">
                    <label className="mb-1 block text-sm font-medium">
                      End Date
                    </label>
                    <Input type="date" />
                  </div>
                  <div className="flex gap-2">
                    <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                      Apply
                    </Button>
                    <Button
                      variant="outline"
                      className="h-9 px-4 shadow-none"
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trial Balance</CardTitle>
                <CardDescription>
                  Pastikan total debit dan kredit seimbang sebelum menyusun laporan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trialRows.map((row) => (
                      <TableRow key={row.code}>
                        <TableCell>{row.code}</TableCell>
                        <TableCell>{row.name}</TableCell>
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
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell />
                      <TableCell className="font-semibold">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        Rp {totalDebit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        Rp {totalCredit.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Balance Status</CardTitle>
                <CardDescription>
                  Informasi apakah trial balance sudah seimbang.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconScale className="h-4 w-4" />
                  <span>
                    Sample data dibuat seimbang mengikuti struktur ERP.
                  </span>
                </div>
                <Badge className="bg-green-100 text-green-700 border-none">
                  Balanced
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

