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
  IconDownload,
} from '@tabler/icons-react'

const assets = [
  { name: 'Cash & Bank', amount: 250_000_000 },
  { name: 'Accounts Receivable', amount: 125_000_000 },
  { name: 'Inventory', amount: 80_000_000 },
] as const

const liabilities = [
  { name: 'Accounts Payable', amount: 75_000_000 },
  { name: 'Taxes Payable', amount: 20_000_000 },
] as const

const equity = [
  { name: 'Owner Equity', amount: 250_000_000 },
  { name: 'Current Year Earnings', amount: 110_000_000 },
] as const

const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0)
const totalLiabilities = liabilities.reduce(
  (sum, l) => sum + l.amount,
  0,
)
const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0)

export default function BalanceSheetPage() {
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
                <h1 className="text-3xl font-bold">Balance Sheet</h1>
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
                  Pilih periode laporan neraca.
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

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Assets</CardTitle>
                  <CardDescription>
                    Semua akun aset perusahaan.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((a) => (
                        <TableRow key={a.name}>
                          <TableCell>{a.name}</TableCell>
                          <TableCell className="text-right">
                            Rp {a.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell>
                          <span className="font-semibold">Total Assets</span>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          Rp {totalAssets.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Liabilities &amp; Equity</CardTitle>
                  <CardDescription>
                    Kewajiban dan modal perusahaan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-semibold">
                        Liabilities
                      </h3>
                      <Badge className="bg-yellow-100 text-yellow-700 border-none">
                        Kewajiban
                      </Badge>
                    </div>
                    <Table>
                      <TableBody>
                        {liabilities.map((l) => (
                          <TableRow key={l.name}>
                            <TableCell>{l.name}</TableCell>
                            <TableCell className="text-right">
                              Rp {l.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell>
                            <span className="font-semibold">
                              Total Liabilities
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            Rp {totalLiabilities.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Equity</h3>
                      <Badge className="bg-green-100 text-green-700 border-none">
                        Modal
                      </Badge>
                    </div>
                    <Table>
                      <TableBody>
                        {equity.map((e) => (
                          <TableRow key={e.name}>
                            <TableCell>{e.name}</TableCell>
                            <TableCell className="text-right">
                              Rp {e.amount.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell>
                            <span className="font-semibold">
                              Total Equity
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            Rp {totalEquity.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-sm font-semibold">
                      Liabilities + Equity
                    </span>
                    <span className="text-sm font-semibold">
                      Rp {(totalLiabilities + totalEquity).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Balance Check</CardTitle>
                <CardDescription>
                  Pastikan Total Assets = Liabilities + Equity.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Sample data mengikuti struktur laporan ERP.
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

