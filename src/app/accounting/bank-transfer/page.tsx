"use client"

import React from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { TransferTab } from '@/components/accounting-bank'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IconPlus, IconSearch, IconFilter, IconArrowRight, IconCalendar, IconEye } from '@tabler/icons-react'



// Mock data
const bankTransfers = [
  {
    id: 'TRF-001',
    fromAccount: 'BCA - 1234567890',
    toAccount: 'Mandiri - 0987654321',
    amount: 50000000,
    transferDate: '2025-10-28',
    description: 'Fund transfer for operational needs',
    reference: 'OP-2025-001',
    status: 'Completed',
    fee: 6500,
    type: 'Internal'
  },
  {
    id: 'TRF-002',
    fromAccount: 'Mandiri - 0987654321',
    toAccount: 'BNI - 5678901234',
    amount: 25000000,
    transferDate: '2025-10-27',
    description: 'Payment to supplier',
    reference: 'SUP-2025-045',
    status: 'Pending',
    fee: 6500,
    type: 'Internal'
  },
  {
    id: 'TRF-003',
    fromAccount: 'BCA - 1234567890',
    toAccount: 'External Bank',
    amount: 15000000,
    transferDate: '2025-10-26',
    description: 'External payment to vendor',
    reference: 'EXT-2025-012',
    status: 'Completed',
    fee: 15000,
    type: 'External'
  },
  {
    id: 'TRF-004',
    fromAccount: 'CIMB - 3456789012',
    toAccount: 'BCA - 1234567890',
    amount: 100000000,
    transferDate: '2025-10-25',
    description: 'Withdraw from investment account',
    reference: 'INV-2025-008',
    status: 'Completed',
    fee: 0,
    type: 'Internal'
  },
  {
    id: 'TRF-005',
    fromAccount: 'BNI - 5678901234',
    toAccount: 'External Bank',
    amount: 75000000,
    transferDate: '2025-10-24',
    description: 'Payment for equipment purchase',
    reference: 'EQP-2025-022',
    status: 'Failed',
    fee: 25000,
    type: 'External'
  }
]

const bankAccountOptions = [
  { value: 'bca-1234567890', label: 'BCA - 1234567890 (Rp 125,000,000)' },
  { value: 'mandiri-0987654321', label: 'Mandiri - 0987654321 (Rp 75,000,000)' },
  { value: 'bni-5678901234', label: 'BNI - 5678901234 (Rp 45,000,000)' },
  { value: 'cimb-3456789012', label: 'CIMB - 3456789012 (Rp 200,000,000)' }
]

function getStatusBadge(status: string) {
  const variants = {
    'Completed': 'default',
    'Pending': 'secondary',
    'Failed': 'destructive',
    'Processing': 'outline'
  } as const
  
  return (
    <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
      {status}
    </Badge>
  )
}

function getTypeBadge(type: string) {
  return (
    <Badge variant={type === 'Internal' ? 'outline' : 'secondary'}>
      {type}
    </Badge>
  )
}

export default function BankTransferPage() {
  const totalTransfers = bankTransfers.length
  const completedTransfers = bankTransfers.filter(t => t.status === 'Completed').length
  const totalAmount = bankTransfers
    .filter(t => t.status === 'Completed')
    .reduce((sum, transfer) => sum + transfer.amount, 0)

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
                <h1 className="text-3xl font-bold">Bank Transfers</h1>
                <p className="text-muted-foreground">
                  Manage transfers between your bank accounts
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <IconPlus className="h-4 w-4 mr-2" />
                    New Transfer
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create Bank Transfer</DialogTitle>
                    <DialogDescription>
                      Transfer funds between your bank accounts.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="fromAccount">From Account</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source account" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccountOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="toAccount">To Account</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination account" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccountOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                          <SelectItem value="external">External Bank Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Transfer Amount</Label>
                      <Input id="amount" type="number" placeholder="0" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="reference">Reference</Label>
                      <Input id="reference" placeholder="e.g. OP-2025-001" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="transferDate">Transfer Date</Label>
                      <Input id="transferDate" type="date" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Transfer description" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Transfer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTransfers}</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedTransfers}</div>
                  <p className="text-xs text-muted-foreground">
                    Successfully processed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp {totalAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Successfully transferred
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search transfers..." className="pl-10" />
              </div>
              <Select defaultValue="all-status">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-type">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-type">All Types</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="external">External</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <IconFilter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>

            {/* Transfers Table */}
            <Card>
              <CardHeader>
                <CardTitle>Bank Transfers</CardTitle>
                <CardDescription>
                  View and manage all bank transfer transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer ID</TableHead>
                      <TableHead>From → To</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankTransfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transfer.id}</div>
                            <div className="text-xs text-muted-foreground">{transfer.reference}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="text-sm">
                              <div className="font-medium">{transfer.fromAccount}</div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <IconArrowRight className="h-3 w-3" />
                                <span>{transfer.toAccount}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">Rp {transfer.amount.toLocaleString()}</div>
                            {transfer.fee > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Fee: Rp {transfer.fee.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <IconCalendar className="h-3 w-3" />
                            <span className="text-sm">{transfer.transferDate}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transfer.status)}
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(transfer.type)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <IconEye className="h-4 w-4" />
                          </Button>
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