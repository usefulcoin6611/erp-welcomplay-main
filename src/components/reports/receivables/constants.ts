// Mock data constants for Receivables
export const CUSTOMER_BALANCE_DATA = [
  { customerName: 'Keire', invoiceBalance: 124250.00, availableCredits: 1000.00, balance: 123250.00 },
  { customerName: 'Ida F. Mullen', invoiceBalance: 14900.00, availableCredits: 0.00, balance: 14900.00 },
  { customerName: 'Xantha Leon', invoiceBalance: 48275.00, availableCredits: 0.00, balance: 48275.00 },
  { customerName: 'Lee Bauer', invoiceBalance: 41202.50, availableCredits: 5000.00, balance: 36202.50 },
  { customerName: 'Kyra Marks', invoiceBalance: 24000.00, availableCredits: 0.00, balance: 24000.00 },
  { customerName: 'Vance Rollins', invoiceBalance: 42830.00, availableCredits: 0.00, balance: 42830.00 },
  { customerName: 'Mohammed Hammed Elhadad', invoiceBalance: 30.00, availableCredits: 0.00, balance: 30.00 },
  { customerName: 'PT Sinar Jaya', invoiceBalance: 85000.00, availableCredits: 2000.00, balance: 83000.00 },
]

export const RECEIVABLE_SUMMARY_DATA = [
  { customerName: 'Mohammed Hammed Elhadad', date: '2025-11-12', transaction: '#INVO00010', status: 'Draft', transactionType: 'Invoice', total: 30.00, balance: 30.00 },
  { customerName: 'Keire', date: '2025-11-12', transaction: '#INVO00011', status: 'Draft', transactionType: 'Invoice', total: 20550.00, balance: 20550.00 },
  { customerName: 'Xantha Leon', date: '2025-08-09', transaction: '#INVO00008', status: 'Sent', transactionType: 'Invoice', total: 17100.00, balance: 17100.00 },
  { customerName: '-', date: '2025-07-07', transaction: 'Credit Note', status: '-', transactionType: 'Credit Note', total: -5000.00, balance: -5000.00 },
  { customerName: 'Keire', date: '2025-07-07', transaction: '#INVO00001', status: 'Partially Paid', transactionType: 'Invoice', total: 105382.50, balance: 103700.00 },
  { customerName: 'Vance Rollins', date: '2025-07-07', transaction: '#INVO00006', status: 'Draft', transactionType: 'Invoice', total: 38200.00, balance: 38200.00 },
  { customerName: 'Ida F. Mullen', date: '2025-07-04', transaction: '#INVO00002', status: 'Sent', transactionType: 'Invoice', total: 14900.00, balance: 14900.00 },
  { customerName: 'Vance Rollins', date: '2025-07-04', transaction: '#INVO00007', status: 'Partially Paid', transactionType: 'Invoice', total: 8747.50, balance: 4630.00 },
  { customerName: 'Lee Bauer', date: '2025-07-04', transaction: '#INVO00009', status: 'Draft', transactionType: 'Invoice', total: 36202.50, balance: 36202.50 },
  { customerName: '-', date: '2025-07-01', transaction: 'Credit Note', status: '-', transactionType: 'Credit Note', total: -1000.00, balance: -1000.00 },
]

export const RECEIVABLE_DETAILS_DATA = [
  { customerName: 'Mohammed Hammed Elhadad', date: '2025-11-12', transaction: '#INVO00010', status: 'Draft', transactionType: 'Invoice', itemName: 'صابون ابركس', quantityOrdered: 1, itemPrice: 50.00, total: 50.00 },
  { customerName: 'Keire', date: '2025-11-12', transaction: '#INVO00011', status: 'Draft', transactionType: 'Invoice', itemName: 'iPhone', quantityOrdered: 8, itemPrice: 1500.00, total: 12000.00 },
  { customerName: 'Keire', date: '2025-11-12', transaction: '#INVO00011', status: 'Draft', transactionType: 'Invoice', itemName: 'Recreation', quantityOrdered: 10, itemPrice: 150.00, total: 1500.00 },
  { customerName: 'Keire', date: '2025-11-12', transaction: '#INVO00011', status: 'Draft', transactionType: 'Invoice', itemName: 'Shrugs', quantityOrdered: 3, itemPrice: 1500.00, total: 4500.00 },
  { customerName: 'Xantha Leon', date: '2025-08-09', transaction: '#INVO00008', status: 'Sent', transactionType: 'Invoice', itemName: 'Professional and technical services.', quantityOrdered: 5, itemPrice: 2000.00, total: 10000.00 },
  { customerName: 'Xantha Leon', date: '2025-08-09', transaction: '#INVO00008', status: 'Sent', transactionType: 'Invoice', itemName: 'Mamaearth Vitamin C Products', quantityOrdered: 15, itemPrice: 400.00, total: 6000.00 },
  { customerName: '-', date: '2025-07-07', transaction: 'Credit Note', status: '-', transactionType: 'Credit Note', itemName: 'oven', quantityOrdered: 0, itemPrice: -5000.00, total: -5000.00 },
  { customerName: '-', date: '2025-07-07', transaction: 'Credit Note', status: '-', transactionType: 'Credit Note', itemName: 'Clock', quantityOrdered: 0, itemPrice: -5000.00, total: -5000.00 },
  { customerName: 'Keire', date: '2025-07-07', transaction: '#INVO00001', status: 'Partially Paid', transactionType: 'Invoice', itemName: 'Shrugs', quantityOrdered: 1, itemPrice: 1500.00, total: 1500.00 },
  { customerName: 'Keire', date: '2025-07-07', transaction: '#INVO00001', status: 'Partially Paid', transactionType: 'Invoice', itemName: 'Recreation', quantityOrdered: 1, itemPrice: 150.00, total: 150.00 },
]

export const AGING_SUMMARY_DATA = [
  { customerName: 'Keire', current: 0.00, days1_15: 20550.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 102700.00, total: 123250.00 },
  { customerName: 'Ida F. Mullen', current: 0.00, days1_15: 0.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 14900.00, total: 14900.00 },
  { customerName: 'Xantha Leon', current: 0.00, days1_15: 0.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 48275.00, total: 48275.00 },
  { customerName: 'Lee Bauer', current: 0.00, days1_15: 0.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 36202.50, total: 36202.50 },
  { customerName: 'Kyra Marks', current: 0.00, days1_15: 0.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 24000.00, total: 24000.00 },
  { customerName: 'Vance Rollins', current: 0.00, days1_15: 0.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 42830.00, total: 42830.00 },
  { customerName: 'Mohammed Hammed Elhadad', current: 30.00, days1_15: 0.00, days16_30: 0.00, days31_45: 0.00, daysOver45: 0.00, total: 30.00 },
]

export const AGING_DETAILS_DATA = [
  { date: '2025-08-08', transaction: '#INVO00001', type: 'Invoice', status: 'Partially Paid', customerName: 'Keire', age: '96 Days', amount: 105382.50, balanceDue: 102700.00 },
  { date: '2025-07-04', transaction: '#INVO00002', type: 'Invoice', status: 'Sent', customerName: 'Ida F. Mullen', age: '131 Days', amount: 14900.00, balanceDue: 14900.00 },
  { date: '2025-07-08', transaction: '#INVO00003', type: 'Invoice', status: 'Draft', customerName: 'Xantha Leon', age: '127 Days', amount: 31175.00, balanceDue: 31175.00 },
  { date: '2025-07-31', transaction: '#INVO00004', type: 'Invoice', status: 'Paid', customerName: 'Lee Bauer', age: '104 Days', amount: 10762.50, balanceDue: 0.00 },
  { date: '2025-07-20', transaction: '#INVO00005', type: 'Invoice', status: 'Partially Paid', customerName: 'Kyra Marks', age: '115 Days', amount: 24780.00, balanceDue: 24000.00 },
  { date: '2025-08-29', transaction: '#INVO00006', type: 'Invoice', status: 'Draft', customerName: 'Vance Rollins', age: '75 Days', amount: 38200.00, balanceDue: 38200.00 },
  { date: '2025-07-04', transaction: '#INVO00007', type: 'Invoice', status: 'Partially Paid', customerName: 'Vance Rollins', age: '131 Days', amount: 8747.50, balanceDue: 4630.00 },
  { date: '2025-09-22', transaction: '#INVO00008', type: 'Invoice', status: 'Sent', customerName: 'Xantha Leon', age: '51 Days', amount: 17100.00, balanceDue: 17100.00 },
  { date: '2025-07-04', transaction: '#INVO00009', type: 'Invoice', status: 'Draft', customerName: 'Lee Bauer', age: '131 Days', amount: 36202.50, balanceDue: 36202.50 },
]

export type ReceivableTab = 'customer-balance' | 'receivable-summary' | 'receivable-details' | 'aging-summary' | 'aging-details'
