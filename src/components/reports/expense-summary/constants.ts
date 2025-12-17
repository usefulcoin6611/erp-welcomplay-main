export interface ExpenseData {
  category: string
  data: number[]
}

export interface ExpenseSummaryFilter {
  period: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly'
  year: string
  category: string
  vendor: string
}

export const periods = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'half-yearly', label: 'Half Yearly' },
  { value: 'yearly', label: 'Yearly' },
]

export const yearList = ['2025', '2024', '2023', '2022', '2021']

export const categories = [
  'All',
  'Office Supplies',
  'Utilities',
  'Salary & Wages',
  'Marketing',
  'Transportation',
  'Maintenance',
]

export const vendors = [
  'All',
  'Vendor A',
  'Vendor B',
  'Vendor C',
  'Vendor D',
  'Individual Suppliers',
]

// Mock data for monthly period (12 months)
export const monthlyMonthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Mock payment data by category
export const mockPaymentData: ExpenseData[] = [
  {
    category: 'Salary & Wages',
    data: [35000000, 35000000, 35000000, 38000000, 38000000, 38000000, 40000000, 40000000, 40000000, 42000000, 42000000, 42000000],
  },
  {
    category: 'Office Supplies',
    data: [5000000, 4500000, 5500000, 6000000, 5200000, 5800000, 6200000, 5900000, 6100000, 6500000, 6300000, 6700000],
  },
  {
    category: 'Utilities',
    data: [3000000, 3200000, 3100000, 3300000, 3400000, 3500000, 3600000, 3700000, 3800000, 3900000, 4000000, 4100000],
  },
]

// Mock bill data by category
export const mockBillData: ExpenseData[] = [
  {
    category: 'Marketing',
    data: [8000000, 9000000, 8500000, 10000000, 11000000, 10500000, 12000000, 11500000, 13000000, 12500000, 14000000, 13500000],
  },
  {
    category: 'Transportation',
    data: [4000000, 4200000, 4100000, 4500000, 4600000, 4700000, 4800000, 4900000, 5000000, 5100000, 5200000, 5300000],
  },
  {
    category: 'Maintenance',
    data: [2000000, 2500000, 2200000, 2800000, 2600000, 2900000, 3000000, 3200000, 3100000, 3400000, 3300000, 3500000],
  },
]

// Calculate total expense (Payment + Bill)
export const calculateTotalExpense = (paymentData: ExpenseData[], billData: ExpenseData[]): number[] => {
  const totalMonths = paymentData[0]?.data.length || 12
  const totals: number[] = Array(totalMonths).fill(0)
  
  paymentData.forEach(payment => {
    payment.data.forEach((value, index) => {
      totals[index] += value
    })
  })
  
  billData.forEach(bill => {
    bill.data.forEach((value, index) => {
      totals[index] += value
    })
  })
  
  return totals
}

// Mock data for quarterly (4 quarters)
export const quarterlyMonthList = ['Q1', 'Q2', 'Q3', 'Q4']

export const mockQuarterlyPaymentData: ExpenseData[] = [
  {
    category: 'Salary & Wages',
    data: [105000000, 114000000, 120000000, 126000000],
  },
  {
    category: 'Office Supplies',
    data: [15000000, 17000000, 18200000, 19500000],
  },
]

export const mockQuarterlyBillData: ExpenseData[] = [
  {
    category: 'Marketing',
    data: [25500000, 31500000, 36500000, 40000000],
  },
  {
    category: 'Transportation',
    data: [12300000, 13800000, 14700000, 15600000],
  },
]

// Mock data for half-yearly (6 months per half)
export const halfYearlyMonthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Mock data for yearly (last 4 years)
export const yearlyMonthList = ['2022', '2023', '2024', '2025']

export const mockYearlyPaymentData: ExpenseData[] = [
  {
    category: 'Salary & Wages',
    data: [420000000, 445000000, 465000000],
  },
  {
    category: 'Office Supplies',
    data: [65000000, 69700000, 75600000],
  },
]

export const mockYearlyBillData: ExpenseData[] = [
  {
    category: 'Marketing',
    data: [110000000, 123500000, 141000000],
  },
  {
    category: 'Transportation',
    data: [52000000, 56400000, 58800000],
  },
]
