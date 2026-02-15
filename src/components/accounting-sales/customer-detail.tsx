'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Pencil, Trash2, Plus, FileText, Receipt } from 'lucide-react'

type CustomerDetailProps = {
  customer: any
  onBack: () => void
  onEdit: (customer: any) => void
  onDelete: (customer: any) => void
}

export function CustomerDetail({ customer, onBack, onEdit, onDelete }: CustomerDetailProps) {
  const [activeTab, setActiveTab] = useState('proposals')
  const proposalCount = 0
  const invoiceCount = 0

  return (
    <div className="space-y-6">
      <Card className="shadow-[0_1px_2px_0_rgb(0_0_0_/_0.03)] border-gray-100">
        <CardHeader className="px-6">
          <div className="flex items-center gap-4 w-full">
            <div className="min-w-0 space-y-1 flex-1">
              <CardTitle className="text-base font-normal truncate">{customer.name}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">Customer Details for {customer.customerCode}</p>
            </div>
            <div className="ml-auto flex items-center gap-2 justify-end">
              <Button variant="outline" size="sm" className="shadow-none h-8 px-3 bg-green-50 text-green-700 hover:bg-green-100 border-green-100">
                Create Invoice
              </Button>
              <Button variant="outline" size="sm" className="shadow-none h-8 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                Create Proposal
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(customer)} className="shadow-none h-8 px-3 bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-100">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(customer)} className="shadow-none h-8 px-3 bg-red-50 text-red-700 hover:bg-red-100 border-red-100">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
              <Button variant="outline" size="sm" onClick={onBack} className="shadow-none h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-none border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Customer Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm">{customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
            <p className="text-sm text-muted-foreground">{customer.contact || '-'}</p>
          </CardContent>
        </Card>

        <Card className="shadow-none border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Billing Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-sm">{customer.billingName || customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.billingAddress || '-'}</p>
            <p className="text-sm text-muted-foreground">
              {customer.billingCity ? `${customer.billingCity}, ` : ''}
              {customer.billingState ? `${customer.billingState}, ` : ''}
              {customer.billingZip || ''}
            </p>
            <p className="text-sm text-muted-foreground">{customer.billingCountry || '-'}</p>
            <p className="text-sm text-muted-foreground">{customer.billingPhone || '-'}</p>
          </CardContent>
        </Card>

        <Card className="shadow-none border-gray-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Shipping Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="text-sm">{customer.shippingName || customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.shippingAddress || '-'}</p>
            <p className="text-sm text-muted-foreground">
              {customer.shippingCity ? `${customer.shippingCity}, ` : ''}
              {customer.shippingState ? `${customer.shippingState}, ` : ''}
              {customer.shippingZip || ''}
            </p>
            <p className="text-sm text-muted-foreground">{customer.shippingCountry || '-'}</p>
            <p className="text-sm text-muted-foreground">{customer.shippingPhone || '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Company Stats */}
      <Card className="shadow-none border-gray-100">
        <CardHeader>
          <CardTitle className="text-base font-normal">Company Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Customer Id</p>
              <p className="text-base font-normal">{customer.customerCode}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Date of Creation</p>
              <p className="text-base font-normal">{new Date(customer.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance</p>
              <p className="text-base font-normal">Rp {(customer.balance || 0).toLocaleString('id-ID')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Tax Number</p>
              <p className="text-base font-normal">{customer.taxNumber || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Sum of Invoices</p>
              <p className="text-base font-normal">Rp {(0).toLocaleString('id-ID')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Quantity of Invoice</p>
              <p className="text-base font-normal">0</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Average Sales</p>
              <p className="text-base font-normal">Rp {(0).toLocaleString('id-ID')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Overdue</p>
              <p className="text-base font-normal text-red-600">Rp {(0).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Tabs */}
      <Tabs defaultValue="proposals" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start h-auto p-0 mb-4 bg-gray-50 rounded-md">
          <TabsTrigger 
            value="proposals" 
            className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-gray-700"
          >
            <FileText className="mr-2 h-4 w-4" />
            Proposal
            <Badge className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-200">{proposalCount}</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="invoices" 
            className="px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary text-gray-700"
          >
            <Receipt className="mr-2 h-4 w-4" />
            Invoice
            <Badge className="ml-2 bg-gray-200 text-gray-700 hover:bg-gray-200">{invoiceCount}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="m-0">
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-gray-600">Proposal</TableHead>
                    <TableHead className="text-gray-600">Issue Date</TableHead>
                    <TableHead className="text-gray-600">Amount</TableHead>
                    <TableHead className="text-gray-600">Status</TableHead>
                    <TableHead className="text-right text-gray-600">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-gray-50 transition-colors">
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-6 w-6 text-gray-400" />
                        <div>No proposals found</div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="m-0">
          <Card className="shadow-sm border-gray-100">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-gray-600">Invoice</TableHead>
                    <TableHead className="text-gray-600">Issue Date</TableHead>
                    <TableHead className="text-gray-600">Due Date</TableHead>
                    <TableHead className="text-gray-600">Due Amount</TableHead>
                    <TableHead className="text-gray-600">Status</TableHead>
                    <TableHead className="text-right text-gray-600">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-gray-50 transition-colors">
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="h-6 w-6 text-gray-400" />
                        <div>No invoices found</div>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
    </div>
  )
}
