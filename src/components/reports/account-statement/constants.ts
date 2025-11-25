import { AccountStatementData, AccountSummary } from './types'

export const MOCK_STATEMENT_DATA: AccountStatementData[] = [
  { id: 1, date: '01 Nov, 2025', amount: 12500000, description: 'Payment from Acme Corporation', type: 'revenue' },
  { id: 2, date: '02 Nov, 2025', amount: -5500000, description: 'Payment to Office Supplies Co', type: 'payment' },
  { id: 3, date: '03 Nov, 2025', amount: 15200000, description: 'Invoice payment - Global Solutions', type: 'revenue' },
  { id: 4, date: '04 Nov, 2025', amount: -8900000, description: 'Marketing services payment', type: 'payment' },
  { id: 5, date: '05 Nov, 2025', amount: 9450000, description: 'Digital Ventures payment', type: 'revenue' },
]

export const MOCK_REVENUE_ACCOUNTS: AccountSummary[] = [
  { id: 1, holderName: 'Cash', total: 45000000, type: 'revenue' },
  { id: 2, holderName: 'John Doe', bankName: 'BCA', total: 125000000, type: 'revenue' },
  { id: 3, holderName: 'Jane Smith', bankName: 'Mandiri', total: 89000000, type: 'revenue' },
  { id: 4, holderName: '', bankName: 'Stripe / Paypal', total: 67000000, type: 'revenue' },
]

export const MOCK_PAYMENT_ACCOUNTS: AccountSummary[] = [
  { id: 5, holderName: 'Cash', total: 32000000, type: 'payment' },
  { id: 6, holderName: 'Company Account', bankName: 'BNI', total: 95000000, type: 'payment' },
  { id: 7, holderName: 'Operations', bankName: 'BRI', total: 52000000, type: 'payment' },
]
