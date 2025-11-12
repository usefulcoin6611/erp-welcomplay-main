import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { 
  IconPlus, 
  IconEdit, 
  IconTrash,
  IconEye,
  IconSearch,
  IconBuildingBank,
  IconCreditCard
} from '@tabler/icons-react'

// Mock data - in real app this would come from API
const bankAccounts = [
  {
    id: 1,
    bankName: 'Bank Central Asia',
    accountName: 'PT Perusahaan Utama',
    accountNumber: '1234567890',
    accountType: 'Current Account',
    balance: 125000000,
    currency: 'IDR',
    status: 'Active',
    description: 'Main company account for operations',
    createdAt: '2025-01-15'
  },
  {
    id: 2,
    bankName: 'Bank Mandiri',
    accountName: 'PT Perusahaan Utama',
    accountNumber: '0987654321',
    accountType: 'Savings Account',
    balance: 75000000,
    currency: 'IDR',
    status: 'Active',
    description: 'Savings account for reserves',
    createdAt: '2025-02-10'
  },
  {
    id: 3,
    bankName: 'Bank Negara Indonesia',
    accountName: 'PT Perusahaan Utama',
    accountNumber: '5678901234',
    accountType: 'Current Account',
    balance: 45000000,
    currency: 'IDR',
    status: 'Active',
    description: 'Secondary operational account',
    createdAt: '2025-03-05'
  },
  {
    id: 4,
    bankName: 'Bank CIMB Niaga',
    accountName: 'PT Perusahaan Utama',
    accountNumber: '3456789012',
    accountType: 'Term Deposit',
    balance: 200000000,
    currency: 'IDR',
    status: 'Active',
    description: 'Fixed deposit for investments',
    createdAt: '2025-04-20'
  },
  {
    id: 5,
    bankName: 'Bank Rakyat Indonesia',
    accountName: 'PT Perusahaan Utama',
    accountNumber: '7890123456',
    accountType: 'Current Account',
    balance: 15000000,
    currency: 'IDR',
    status: 'Inactive',
    description: 'Backup account (currently inactive)',
    createdAt: '2025-05-12'
  }
]

function getStatusBadge(status: string) {
  return (
    <Badge variant={status === 'Active' ? 'default' : 'secondary'}>
      {status}
    </Badge>
  )
}

function getAccountTypeIcon(type: string) {
  switch (type) {
    case 'Current Account':
      return <IconBuildingBank className="h-4 w-4" />
    case 'Savings Account':
      return <IconCreditCard className="h-4 w-4" />
    case 'Term Deposit':
      return <IconBuildingBank className="h-4 w-4" />
    default:
      return <IconBuildingBank className="h-4 w-4" />
  }
}

export default function BankAccountPage() {
  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Bank Accounts</h1>
                <p className="text-muted-foreground">
                  Manage your company bank accounts and balances
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Add Bank Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Add New Bank Account</DialogTitle>
                    <DialogDescription>
                      Enter the details of your new bank account.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input id="bankName" placeholder="e.g. Bank Central Asia" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="accountName">Account Name</Label>
                      <Input id="accountName" placeholder="e.g. PT Perusahaan Utama" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input id="accountNumber" placeholder="e.g. 1234567890" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="accountType">Account Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="current">Current Account</SelectItem>
                          <SelectItem value="savings">Savings Account</SelectItem>
                          <SelectItem value="term">Term Deposit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="initialBalance">Initial Balance</Label>
                      <Input id="initialBalance" type="number" placeholder="0" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Optional description" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Account</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bankAccounts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {bankAccounts.filter(a => a.status === 'Active').length} active accounts
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp {totalBalance.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Across all active accounts
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Main Account</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">BCA</div>
                  <p className="text-xs text-muted-foreground">
                    Primary operational account
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search bank accounts..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bank Accounts Table */}
            <Card>
              <CardHeader>
                <CardTitle>Bank Accounts</CardTitle>
                <CardDescription>
                  Manage and monitor all your company bank accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bank Details</TableHead>
                      <TableHead>Account Info</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{account.bankName}</div>
                            <div className="text-sm text-muted-foreground">{account.accountName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm">{account.accountNumber}</div>
                          <div className="text-xs text-muted-foreground">{account.description}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAccountTypeIcon(account.accountType)}
                            <span className="text-sm">{account.accountType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">Rp {account.balance.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{account.currency}</div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(account.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <IconEye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <IconEdit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
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