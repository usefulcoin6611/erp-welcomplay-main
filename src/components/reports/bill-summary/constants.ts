// Bill Summary Report Constants and Types

export type BillStatus = 'draft' | 'sent' | 'unpaid' | 'partial' | 'paid'

export interface Bill {
  id: string
  billNumber: string
  date: string
  vendor: string
  category: string
  status: BillStatus
  paidAmount: number
  dueAmount: number
  paymentDate: string
  total: number
}

export interface BillSummaryStats {
  totalBill: number
  totalPaid: number
  totalDue: number
}

export interface MonthlyBillData {
  month: string
  amount: number
}

// Mock data for bills
export const mockBills: Bill[] = [
  {
    id: '1',
    billNumber: 'BILL-00001',
    date: '2025-11-01',
    vendor: 'PT. Supplier Utama',
    category: 'Office Supplies',
    status: 'paid',
    paidAmount: 15000000,
    dueAmount: 0,
    paymentDate: '2025-11-15',
    total: 15000000
  },
  {
    id: '2',
    billNumber: 'BILL-00002',
    date: '2025-11-05',
    vendor: 'CV. Teknologi Maju',
    category: 'Equipment',
    status: 'partial',
    paidAmount: 12000000,
    dueAmount: 8000000,
    paymentDate: '2025-11-20',
    total: 20000000
  },
  {
    id: '3',
    billNumber: 'BILL-00003',
    date: '2025-11-08',
    vendor: 'PT. Global Supplies',
    category: 'Raw Materials',
    status: 'unpaid',
    paidAmount: 0,
    dueAmount: 3200000,
    paymentDate: '',
    total: 3200000
  },
  {
    id: '4',
    billNumber: 'BILL-00004',
    date: '2025-11-10',
    vendor: 'CV. Mitra Sejahtera',
    category: 'Services',
    status: 'unpaid',
    paidAmount: 0,
    dueAmount: 7800000,
    paymentDate: '',
    total: 7800000
  },
  {
    id: '5',
    billNumber: 'BILL-00005',
    date: '2025-11-12',
    vendor: 'PT. Maju Jaya',
    category: 'Equipment',
    status: 'paid',
    paidAmount: 22000000,
    dueAmount: 0,
    paymentDate: '2025-11-25',
    total: 22000000
  },
  {
    id: '6',
    billNumber: 'BILL-00006',
    date: '2025-10-28',
    vendor: 'CV. Sumber Makmur',
    category: 'Raw Materials',
    status: 'partial',
    paidAmount: 10000000,
    dueAmount: 8000000,
    paymentDate: '2025-11-10',
    total: 18000000
  },
  {
    id: '7',
    billNumber: 'BILL-00007',
    date: '2025-10-20',
    vendor: 'PT. Telkom Indonesia',
    category: 'Utilities',
    status: 'paid',
    paidAmount: 8500000,
    dueAmount: 0,
    paymentDate: '2025-11-05',
    total: 8500000
  },
  {
    id: '8',
    billNumber: 'BILL-00008',
    date: '2025-10-15',
    vendor: 'CV. Office Furniture',
    category: 'Office Supplies',
    status: 'paid',
    paidAmount: 9800000,
    dueAmount: 0,
    paymentDate: '2025-10-30',
    total: 9800000
  },
  {
    id: '9',
    billNumber: 'BILL-00009',
    date: '2025-10-10',
    vendor: 'PT. Cleaning Services',
    category: 'Services',
    status: 'unpaid',
    paidAmount: 0,
    dueAmount: 2800000,
    paymentDate: '',
    total: 2800000
  },
  {
    id: '10',
    billNumber: 'BILL-00010',
    date: '2025-10-05',
    vendor: 'CV. Security Solutions',
    category: 'Services',
    status: 'sent',
    paidAmount: 0,
    dueAmount: 5600000,
    paymentDate: '',
    total: 5600000
  },
  {
    id: '11',
    billNumber: 'BILL-00011',
    date: '2025-09-25',
    vendor: 'PT. IT Services',
    category: 'Technology',
    status: 'paid',
    paidAmount: 15000000,
    dueAmount: 0,
    paymentDate: '2025-10-10',
    total: 15000000
  },
  {
    id: '12',
    billNumber: 'BILL-00012',
    date: '2025-09-20',
    vendor: 'CV. Maintenance Pro',
    category: 'Services',
    status: 'paid',
    paidAmount: 11500000,
    dueAmount: 0,
    paymentDate: '2025-10-05',
    total: 11500000
  },
]

// Monthly bill summary data for chart (last 6 months)
export const mockMonthlyBillData: MonthlyBillData[] = [
  { month: 'Jun', amount: 45000000 },
  { month: 'Jul', amount: 52000000 },
  { month: 'Aug', amount: 48000000 },
  { month: 'Sep', amount: 56000000 },
  { month: 'Oct', amount: 62000000 },
  { month: 'Nov', amount: 68000000 },
]

// Status badge styles
export const statusStyles: Record<BillStatus, { label: string; className: string }> = {
  draft: { 
    label: 'Draft', 
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' 
  },
  sent: { 
    label: 'Sent', 
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
  },
  unpaid: { 
    label: 'Unpaid', 
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' 
  },
  partial: { 
    label: 'Partial', 
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' 
  },
  paid: { 
    label: 'Paid', 
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
  },
}

// Available vendors for filter
export const availableVendors = [
  'All',
  'PT. Supplier Utama',
  'CV. Teknologi Maju',
  'PT. Global Supplies',
  'CV. Mitra Sejahtera',
  'PT. Maju Jaya',
  'CV. Sumber Makmur',
  'PT. Telkom Indonesia',
  'CV. Office Furniture',
  'PT. Cleaning Services',
  'CV. Security Solutions',
  'PT. IT Services',
  'CV. Maintenance Pro',
]

// Available statuses for filter
export const availableStatuses: (BillStatus | 'all')[] = [
  'all',
  'draft',
  'sent',
  'unpaid',
  'partial',
  'paid',
]
