export interface CashFlowCategory {
  id: string
  category: string
  data: number[] // 12 months data
}

export interface CashFlowData {
  revenue: CashFlowCategory[]
  invoice: CashFlowCategory[]
  payment: CashFlowCategory[]
  bill: CashFlowCategory[]
}

export const monthList = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export const yearList = ['2023', '2024', '2025', '2026']

export type ViewType = 'monthly' | 'quarterly'

// Mock data for Cash Flow
export const mockCashFlowData: CashFlowData = {
  revenue: [
    {
      id: '1',
      category: 'Product Sales',
      data: [15000000, 18000000, 22000000, 19000000, 21000000, 25000000, 23000000, 24000000, 26000000, 28000000, 30000000, 32000000]
    },
    {
      id: '2',
      category: 'Service Revenue',
      data: [8000000, 9000000, 10000000, 11000000, 9500000, 10500000, 12000000, 13000000, 14000000, 15000000, 16000000, 17000000]
    },
    {
      id: '3',
      category: 'Consulting Fees',
      data: [5000000, 6000000, 5500000, 7000000, 6500000, 8000000, 7500000, 9000000, 8500000, 10000000, 9500000, 11000000]
    }
  ],
  invoice: [
    {
      id: '4',
      category: 'Invoice Category A',
      data: [12000000, 14000000, 16000000, 15000000, 17000000, 19000000, 18000000, 20000000, 21000000, 22000000, 23000000, 24000000]
    },
    {
      id: '5',
      category: 'Invoice Category B',
      data: [6000000, 7000000, 8000000, 9000000, 8500000, 9500000, 10000000, 11000000, 12000000, 13000000, 14000000, 15000000]
    }
  ],
  payment: [
    {
      id: '6',
      category: 'Salary & Wages',
      data: [10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000, 10000000]
    },
    {
      id: '7',
      category: 'Office Rent',
      data: [5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000, 5000000]
    },
    {
      id: '8',
      category: 'Utilities',
      data: [1500000, 1600000, 1700000, 1800000, 1900000, 2000000, 2100000, 2200000, 2300000, 2400000, 2500000, 2600000]
    }
  ],
  bill: [
    {
      id: '9',
      category: 'Supplier Bills',
      data: [8000000, 9000000, 10000000, 11000000, 12000000, 13000000, 14000000, 15000000, 16000000, 17000000, 18000000, 19000000]
    },
    {
      id: '10',
      category: 'Equipment Purchase',
      data: [3000000, 2000000, 4000000, 3500000, 2500000, 5000000, 4500000, 3000000, 6000000, 4000000, 3500000, 5500000]
    }
  ]
}

// Calculate totals
export const calculateTotals = (data: CashFlowData) => {
  const totalIncome = monthList.map((_, index) => {
    const revenueTotal = data.revenue.reduce((sum, cat) => sum + cat.data[index], 0)
    const invoiceTotal = data.invoice.reduce((sum, cat) => sum + cat.data[index], 0)
    return revenueTotal + invoiceTotal
  })

  const totalExpense = monthList.map((_, index) => {
    const paymentTotal = data.payment.reduce((sum, cat) => sum + cat.data[index], 0)
    const billTotal = data.bill.reduce((sum, cat) => sum + cat.data[index], 0)
    return paymentTotal + billTotal
  })

  const netProfit = monthList.map((_, index) => totalIncome[index] - totalExpense[index])

  return { totalIncome, totalExpense, netProfit }
}
