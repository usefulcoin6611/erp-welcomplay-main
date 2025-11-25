// Mock data constants for Payables
export const VENDOR_BALANCE_DATA = [
  { vendor: 'PT. Maju Jaya', totalBilled: 27500000, availableDebit: 0, closingBalance: 27500000 },
  { vendor: 'CV. Sumber Makmur', totalBilled: 30500000, availableDebit: 2000000, closingBalance: 28500000 },
  { vendor: 'UD. Berkah Sentosa', totalBilled: 21500000, availableDebit: 0, closingBalance: 21500000 },
  { vendor: 'PT. Global Supplies', totalBilled: 7400000, availableDebit: 0, closingBalance: 7400000 },
  { vendor: 'CV. Mitra Sejahtera', totalBilled: 17600000, availableDebit: 1000000, closingBalance: 16600000 },
  { vendor: 'PT. Indo Supplies', totalBilled: 15300000, availableDebit: 0, closingBalance: 15300000 },
  { vendor: 'UD. Sinar Abadi', totalBilled: 8900000, availableDebit: 0, closingBalance: 8900000 },
  { vendor: 'CV. Cahaya Baru', totalBilled: 12200000, availableDebit: 500000, closingBalance: 11700000 },
]

export const PAYABLE_SUMMARY_DATA = [
  { vendor: 'PT. Maju Jaya', date: '01/11/2025', transaction: 'BILL-00001', status: 'Paid', transactionType: 'Bill', total: 5500000, balance: 0 },
  { vendor: 'CV. Sumber Makmur', date: '03/11/2025', transaction: 'BILL-00002', status: 'Partial', transactionType: 'Bill', total: 12500000, balance: 4500000 },
  { vendor: 'UD. Berkah Sentosa', date: '05/11/2025', transaction: 'BILL-00003', status: 'Unpaid', transactionType: 'Bill', total: 15000000, balance: 15000000 },
  { vendor: 'PT. Global Supplies', date: '07/11/2025', transaction: 'BILL-00004', status: 'Unpaid', transactionType: 'Bill', total: 3200000, balance: 3200000 },
  { vendor: 'CV. Mitra Sejahtera', date: '10/11/2025', transaction: 'BILL-00005', status: 'Unpaid', transactionType: 'Bill', total: 7800000, balance: 7800000 },
  { vendor: 'PT. Maju Jaya', date: '12/11/2025', transaction: 'BILL-00006', status: 'Paid', transactionType: 'Bill', total: 22000000, balance: 0 },
  { vendor: 'CV. Sumber Makmur', date: '28/10/2025', transaction: 'BILL-00007', status: 'Partial', transactionType: 'Bill', total: 18000000, balance: 8000000 },
  { vendor: 'UD. Berkah Sentosa', date: '25/10/2025', transaction: 'BILL-00008', status: 'Paid', transactionType: 'Bill', total: 6500000, balance: 0 },
  { vendor: 'PT. Global Supplies', date: '20/10/2025', transaction: 'BILL-00009', status: 'Unpaid', transactionType: 'Bill', total: 4200000, balance: 4200000 },
  { vendor: 'CV. Mitra Sejahtera', date: '15/10/2025', transaction: 'BILL-00010', status: 'Paid', transactionType: 'Bill', total: 9800000, balance: 0 },
]

export const PAYABLE_DETAILS_DATA = [
  { vendor: 'PT. Maju Jaya', date: '01/11/2025', transaction: 'BILL-00001', status: 'Paid', transactionType: 'Bill', itemName: 'Office Supplies', quantityOrdered: 50, itemPrice: 110000, total: 5500000 },
  { vendor: 'CV. Sumber Makmur', date: '03/11/2025', transaction: 'BILL-00002', status: 'Partial', transactionType: 'Bill', itemName: 'Furniture', quantityOrdered: 25, itemPrice: 500000, total: 12500000 },
  { vendor: 'UD. Berkah Sentosa', date: '05/11/2025', transaction: 'BILL-00003', status: 'Unpaid', transactionType: 'Bill', itemName: 'Electronics', quantityOrdered: 10, itemPrice: 1500000, total: 15000000 },
  { vendor: 'PT. Global Supplies', date: '07/11/2025', transaction: 'BILL-00004', status: 'Unpaid', transactionType: 'Bill', itemName: 'Stationery', quantityOrdered: 100, itemPrice: 32000, total: 3200000 },
  { vendor: 'CV. Mitra Sejahtera', date: '10/11/2025', transaction: 'BILL-00005', status: 'Unpaid', transactionType: 'Bill', itemName: 'Computer Parts', quantityOrdered: 20, itemPrice: 390000, total: 7800000 },
  { vendor: 'PT. Maju Jaya', date: '12/11/2025', transaction: 'BILL-00006', status: 'Paid', transactionType: 'Bill', itemName: 'Raw Materials', quantityOrdered: 200, itemPrice: 110000, total: 22000000 },
]

export const AGING_SUMMARY_DATA = [
  { vendor: 'PT. Maju Jaya', current: 0, days1_15: 0, days16_30: 0, days31_45: 0, over45Days: 27500000, total: 27500000 },
  { vendor: 'CV. Sumber Makmur', current: 0, days1_15: 4500000, days16_30: 8000000, days31_45: 0, over45Days: 16000000, total: 28500000 },
  { vendor: 'UD. Berkah Sentosa', current: 15000000, days1_15: 0, days16_30: 6500000, days31_45: 0, over45Days: 0, total: 21500000 },
  { vendor: 'PT. Global Supplies', current: 3200000, days1_15: 4200000, days16_30: 0, days31_45: 0, over45Days: 0, total: 7400000 },
  { vendor: 'CV. Mitra Sejahtera', current: 7800000, days1_15: 0, days16_30: 0, days31_45: 9800000, over45Days: 0, total: 17600000 },
]

export const AGING_DETAILS_DATA = [
  { date: '01/11/2025', transaction: 'BILL-00001', type: 'Bill', status: 'Paid', vendor: 'PT. Maju Jaya', age: 11, amount: 5500000, balanceDue: 0 },
  { date: '03/11/2025', transaction: 'BILL-00002', type: 'Bill', status: 'Partial', vendor: 'CV. Sumber Makmur', age: 9, amount: 12500000, balanceDue: 4500000 },
  { date: '05/11/2025', transaction: 'BILL-00003', type: 'Bill', status: 'Unpaid', vendor: 'UD. Berkah Sentosa', age: 7, amount: 15000000, balanceDue: 15000000 },
  { date: '07/11/2025', transaction: 'BILL-00004', type: 'Bill', status: 'Unpaid', vendor: 'PT. Global Supplies', age: 5, amount: 3200000, balanceDue: 3200000 },
  { date: '10/11/2025', transaction: 'BILL-00005', type: 'Bill', status: 'Unpaid', vendor: 'CV. Mitra Sejahtera', age: 2, amount: 7800000, balanceDue: 7800000 },
  { date: '12/11/2025', transaction: 'BILL-00006', type: 'Bill', status: 'Paid', vendor: 'PT. Maju Jaya', age: 0, amount: 22000000, balanceDue: 0 },
  { date: '28/10/2025', transaction: 'BILL-00007', type: 'Bill', status: 'Partial', vendor: 'CV. Sumber Makmur', age: 15, amount: 18000000, balanceDue: 8000000 },
  { date: '25/10/2025', transaction: 'BILL-00008', type: 'Bill', status: 'Paid', vendor: 'UD. Berkah Sentosa', age: 18, amount: 6500000, balanceDue: 0 },
  { date: '20/10/2025', transaction: 'BILL-00009', type: 'Bill', status: 'Unpaid', vendor: 'PT. Global Supplies', age: 23, amount: 4200000, balanceDue: 4200000 },
  { date: '15/10/2025', transaction: 'BILL-00010', type: 'Bill', status: 'Paid', vendor: 'CV. Mitra Sejahtera', age: 28, amount: 9800000, balanceDue: 0 },
]

export type PayableTab = 'vendor-balance' | 'payable-summary' | 'payable-details' | 'aging-summary' | 'aging-details'
