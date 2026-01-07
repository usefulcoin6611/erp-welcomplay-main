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
  IconTrendingDown,
  IconTrendingUp,
} from '@tabler/icons-react'

const income = [
  { name: 'Sales Revenue', amount: 420_000_000 },
  { name: 'Service Revenue', amount: 80_000_000 },
] as const

const cogs = [{ name: 'Cost of Goods Sold', amount: 220_000_000 }] as const

const expenses = [
  { name: 'Operating Expenses', amount: 90_000_000 },
  { name: 'Marketing Expenses', amount: 25_000_000 },
] as const

const totalIncome = income.reduce((sum, i) => sum + i.amount, 0)
const totalCogs = cogs.reduce((sum, c) => sum + c.amount, 0)
const grossProfit = totalIncome - totalCogs
const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
const netProfit = grossProfit - totalExpenses

export default function ProfitLossPage() {
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
                <h1 className="text-3xl font-bold">Profit &amp; Loss</h1>
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
                  Pilih periode laporan laba rugi.
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

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      Rp {totalIncome.toLocaleString()}
                    </div>
                    <IconTrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Gross Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      Rp {grossProfit.toLocaleString()}
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-none">
                      Income - COGS
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Net Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      Rp {netProfit.toLocaleString()}
                    </div>
                    <IconTrendingUp className="h-5 w-5 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Income</CardTitle>
                <CardDescription>
                  Pendapatan utama perusahaan.
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
                    {income.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="text-right">
                          Rp {row.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <span className="font-semibold">Total Income</span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        Rp {totalIncome.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost of Goods Sold</CardTitle>
                <CardDescription>
                  Beban langsung terkait penjualan barang.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {cogs.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="text-right">
                          Rp {row.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <span className="font-semibold">Total COGS</span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        Rp {totalCogs.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Operating Expenses</CardTitle>
                <CardDescription>
                  Beban operasional perusahaan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    {expenses.map((row) => (
                      <TableRow key={row.name}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell className="text-right">
                          Rp {row.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell>
                        <span className="font-semibold">
                          Total Operating Expenses
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        Rp {totalExpenses.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  Ringkasan laba rugi untuk periode terpilih.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <IconTrendingUp className="h-4 w-4 text-emerald-500" />
                    <span>Total Income - COGS - Expenses</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <IconTrendingDown className="h-4 w-4" />
                    <span>Sample data mengikuti struktur ERP</span>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-none">
                  Net Profit Rp {netProfit.toLocaleString()}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

