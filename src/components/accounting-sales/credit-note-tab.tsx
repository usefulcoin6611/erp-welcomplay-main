'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Send,
  Calendar,
  FileText,
  CreditCard
} from 'lucide-react'

// Mock data
const creditNotesData = [
  {
    id: 'CN-001',
    date: '2024-01-14',
    customer: 'ABC Corporation',
    customerEmail: 'contact@abccorp.com',
    invoiceReference: 'INV-001',
    reason: 'Service refund - partial completion',
    amount: 2500,
    status: 'applied',
  },
  {
    id: 'CN-002',
    date: '2024-01-12',
    customer: 'XYZ Technologies',
    customerEmail: 'billing@xyztech.com',
    invoiceReference: 'INV-002',
    reason: 'Product return - quality issues',
    amount: 1200,
    status: 'pending',
  },
]

function getStatusClasses(status: string) {
  switch (status) {
    case 'applied': return 'bg-green-100 text-green-700 border-none'
    case 'pending': return 'bg-yellow-100 text-yellow-700 border-none'
    case 'draft': return 'bg-gray-100 text-gray-700 border-none'
    case 'cancelled': return 'bg-red-100 text-red-700 border-none'
    default: return 'bg-slate-100 text-slate-700 border-none'
  }
}

export function CreditNoteTab() {
  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-end">
        <Button variant="blue" size="sm" className="shadow-none h-7">
          <Plus className="h-3 w-3 mr-2" />
          Create Credit Note
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter credit notes by status and customer.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 min-w-0">
              <label className="mb-1 block text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search credit notes..." className="pl-8 w-full" />
              </div>
            </div>
            <div className="w-full md:w-40">
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Select defaultValue="all-status">
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Credit notes table */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Notes List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Credit Note #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Invoice Ref</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {creditNotesData.map((creditNote) => (
                <TableRow key={creditNote.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{creditNote.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span className="text-sm">{creditNote.date}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{creditNote.customer}</p>
                      <p className="text-sm text-muted-foreground">{creditNote.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-50 text-blue-700 border-none">{creditNote.invoiceReference}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px]">
                      <p className="text-sm truncate" title={creditNote.reason}>{creditNote.reason}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-blue-600">${creditNote.amount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusClasses(creditNote.status)}>{creditNote.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Credit Note</DropdownMenuItem>
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Edit Credit Note</DropdownMenuItem>
                        <DropdownMenuItem><Download className="mr-2 h-4 w-4" />Download PDF</DropdownMenuItem>
                        <DropdownMenuItem><Send className="mr-2 h-4 w-4" />Send to Customer</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
