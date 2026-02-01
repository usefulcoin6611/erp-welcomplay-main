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
  IconPlus,
  IconSearch,
} from '@tabler/icons-react'

const accountTypes = [
  {
    type: 'Assets',
    accounts: [
      {
        code: '1000',
        name: 'Cash & Bank',
        subType: 'Current Assets',
        balance: 250_000_000,
        status: 'Active',
      },
      {
        code: '1100',
        name: 'Accounts Receivable',
        subType: 'Current Assets',
        balance: 125_000_000,
        status: 'Active',
      },
    ],
  },
  {
    type: 'Liabilities',
    accounts: [
      {
        code: '2000',
        name: 'Accounts Payable',
        subType: 'Current Liabilities',
        balance: 75_000_000,
        status: 'Active',
      },
    ],
  },
] as const

function getAccountStatusClasses(status: string) {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-700 border-none'
    case 'Inactive':
      return 'bg-gray-100 text-gray-700 border-none'
    default:
      return 'bg-slate-100 text-slate-700 border-none'
  }
}

export default function ChartOfAccountPage() {
  const totalAccounts = accountTypes.reduce(
    (sum, group) => sum + group.accounts.length,
    0,
  )

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
                <h1 className="text-3xl font-bold">Chart of Accounts</h1>
              </div>
              <Button className="h-9 px-4 bg-blue-500 hover:bg-blue-600 shadow-none">
                <IconPlus className="mr-2 h-4 w-4" />
                Create Account
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="px-6 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="text-2xl font-bold">{totalAccounts}</div>
                  <p className="text-xs text-muted-foreground">
                    Semua akun dalam sistem
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] border-0 bg-white w-full">
              <CardHeader className="px-6">
                <CardTitle>Filters</CardTitle>
                <CardDescription>
                  Filter akun berdasarkan tipe, sub tipe, dan status.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 py-4">
                <form className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[1fr_14rem_14rem] md:justify-start">
                  <div className="min-w-0">
                    <label className="mb-1 block text-sm font-medium">
                      Search
                    </label>
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                      <Input
                        placeholder="Cari nama atau kode akun..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="mb-1 block text-sm font-medium">
                      Account Type
                    </label>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full h-9 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="assets">Assets</SelectItem>
                        <SelectItem value="liabilities">Liabilities</SelectItem>
                        <SelectItem value="equity">Equity</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="mb-1 block text-sm font-medium">
                      Status
                    </label>
                    <Select defaultValue="all">
                      <SelectTrigger className="w-full h-9 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardContent>
            </Card>

            {accountTypes.map((group) => (
              <Card key={group.type}>
                <CardHeader className="px-6">
                  <CardTitle>{group.type}</CardTitle>
                  <CardDescription>
                    Akun di bawah tipe {group.type}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="px-6">Code</TableHead>
                        <TableHead className="px-6">Account Name</TableHead>
                        <TableHead className="px-6">Sub Type</TableHead>
                        <TableHead className="px-6">Balance</TableHead>
                        <TableHead className="px-6">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.accounts.map((account) => (
                        <TableRow key={account.code}>
                          <TableCell className="px-6">
                            <span className="text-sm font-medium">
                              {account.code}
                            </span>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="text-sm font-medium">
                              {account.name}
                            </div>
                          </TableCell>
                          <TableCell className="px-6">
                            <span className="text-sm text-muted-foreground">
                              {account.subType}
                            </span>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="font-medium">
                              Rp {account.balance.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="px-6">
                            <Badge
                              className={getAccountStatusClasses(account.status)}
                            >
                              {account.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

