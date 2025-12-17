export interface Transaction {
  id: string
  date: string
  account: string
  accountType: 'bank' | 'cash' | 'online'
  type: 'Income' | 'Expense'
  category: string
  description: string
  amount: number
}

export interface AccountSummary {
  id: string
  holderName: string
  bankName?: string
  total: number
  type: 'bank' | 'cash' | 'online'
}

export const availableAccounts = [
  'All',
  'Cash',
  'Bank BCA - John Doe',
  'Bank Mandiri - Jane Smith',
  'Stripe / Paypal',
]

export const availableCategories = [
  'All',
  'Sales',
  'Service',
  'Purchase',
  'Salary',
  'Rent',
  'Utilities',
  'Marketing',
  'Other',
]

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2025-11-01',
    account: 'Cash',
    accountType: 'cash',
    type: 'Income',
    category: 'Sales',
    description: 'Product sales payment',
    amount: 5000000,
  },
  {
    id: '2',
    date: '2025-11-02',
    account: 'Bank BCA - John Doe',
    accountType: 'bank',
    type: 'Expense',
    category: 'Salary',
    description: 'Monthly salary payment',
    amount: 15000000,
  },
  {
    id: '3',
    date: '2025-11-03',
    account: 'Stripe / Paypal',
    accountType: 'online',
    type: 'Income',
    category: 'Service',
    description: 'Online service payment',
    amount: 3500000,
  },
  {
    id: '4',
    date: '2025-11-05',
    account: 'Cash',
    accountType: 'cash',
    type: 'Expense',
    category: 'Purchase',
    description: 'Office supplies purchase',
    amount: 1200000,
  },
  {
    id: '5',
    date: '2025-11-07',
    account: 'Bank Mandiri - Jane Smith',
    accountType: 'bank',
    type: 'Expense',
    category: 'Rent',
    description: 'Office rent payment',
    amount: 8000000,
  },
  {
    id: '6',
    date: '2025-11-10',
    account: 'Cash',
    accountType: 'cash',
    type: 'Income',
    category: 'Sales',
    description: 'Walk-in customer payment',
    amount: 2500000,
  },
  {
    id: '7',
    date: '2025-11-12',
    account: 'Bank BCA - John Doe',
    accountType: 'bank',
    type: 'Expense',
    category: 'Utilities',
    description: 'Electricity and water bill',
    amount: 2000000,
  },
  {
    id: '8',
    date: '2025-11-15',
    account: 'Stripe / Paypal',
    accountType: 'online',
    type: 'Income',
    category: 'Service',
    description: 'Subscription payment',
    amount: 4500000,
  },
  {
    id: '9',
    date: '2025-11-18',
    account: 'Cash',
    accountType: 'cash',
    type: 'Expense',
    category: 'Marketing',
    description: 'Advertising campaign',
    amount: 3000000,
  },
  {
    id: '10',
    date: '2025-11-20',
    account: 'Bank Mandiri - Jane Smith',
    accountType: 'bank',
    type: 'Income',
    category: 'Sales',
    description: 'Corporate client payment',
    amount: 12000000,
  },
  {
    id: '11',
    date: '2025-11-22',
    account: 'Cash',
    accountType: 'cash',
    type: 'Expense',
    category: 'Other',
    description: 'Miscellaneous expenses',
    amount: 500000,
  },
  {
    id: '12',
    date: '2025-11-25',
    account: 'Bank BCA - John Doe',
    accountType: 'bank',
    type: 'Income',
    category: 'Service',
    description: 'Consulting service fee',
    amount: 7500000,
  },
]

export const mockAccountSummary: AccountSummary[] = [
  {
    id: '1',
    holderName: 'Cash',
    total: 2800000,
    type: 'cash',
  },
  {
    id: '2',
    holderName: 'John Doe',
    bankName: 'Bank BCA',
    total: -9500000,
    type: 'bank',
  },
  {
    id: '3',
    holderName: 'Jane Smith',
    bankName: 'Bank Mandiri',
    total: 4000000,
    type: 'bank',
  },
  {
    id: '4',
    holderName: 'Stripe / Paypal',
    total: 8000000,
    type: 'online',
  },
]
