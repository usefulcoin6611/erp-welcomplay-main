export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'partial'

export interface InvoiceRecord {
  id: number
  number: string
  customer: string
  issueDate: string // YYYY-MM-DD
  category: string
  status: InvoiceStatus
  total: number
  balance: number
  paymentDate?: string
}

// Expanded mock data (Jun-Nov 2025)
export const mockInvoices: InvoiceRecord[] = [
  // June 2025
  { id: 1, number: 'INV-2025-001', customer: 'PT Sinar Jaya', issueDate: '2025-06-01', category: 'Services', status: 'paid', total: 12500000, balance: 0, paymentDate: '2025-06-10' },
  { id: 2, number: 'INV-2025-002', customer: 'CV Mandiri Abadi', issueDate: '2025-06-03', category: 'Consulting', status: 'unpaid', total: 8400000, balance: 8400000 },
  { id: 3, number: 'INV-2025-003', customer: 'PT Nusantara Tech', issueDate: '2025-06-04', category: 'Software', status: 'partial', total: 9600000, balance: 3200000, paymentDate: '2025-06-12' },
  { id: 4, number: 'INV-2025-004', customer: 'PT Sinar Jaya', issueDate: '2025-06-05', category: 'Services', status: 'overdue', total: 7200000, balance: 7200000 },
  { id: 5, number: 'INV-2025-005', customer: 'PT Global Media', issueDate: '2025-06-06', category: 'Media', status: 'paid', total: 15500000, balance: 0, paymentDate: '2025-06-14' },
  { id: 6, number: 'INV-2025-006', customer: 'CV Mandiri Abadi', issueDate: '2025-06-07', category: 'Consulting', status: 'unpaid', total: 4300000, balance: 4300000 },
  { id: 7, number: 'INV-2025-007', customer: 'PT Sinar Jaya', issueDate: '2025-06-08', category: 'Support', status: 'paid', total: 5100000, balance: 0, paymentDate: '2025-06-16' },
  { id: 8, number: 'INV-2025-008', customer: 'PT Nusantara Tech', issueDate: '2025-06-09', category: 'Software', status: 'overdue', total: 13200000, balance: 13200000 },
  { id: 9, number: 'INV-2025-009', customer: 'PT Global Media', issueDate: '2025-06-12', category: 'Media', status: 'paid', total: 18200000, balance: 0, paymentDate: '2025-06-20' },
  { id: 10, number: 'INV-2025-010', customer: 'CV Mandiri Abadi', issueDate: '2025-06-15', category: 'Services', status: 'paid', total: 6800000, balance: 0, paymentDate: '2025-06-22' },
  { id: 11, number: 'INV-2025-011', customer: 'PT Sinar Jaya', issueDate: '2025-06-18', category: 'Consulting', status: 'partial', total: 11200000, balance: 4500000, paymentDate: '2025-06-25' },
  { id: 12, number: 'INV-2025-012', customer: 'PT Nusantara Tech', issueDate: '2025-06-20', category: 'Software', status: 'paid', total: 22500000, balance: 0, paymentDate: '2025-06-28' },
  { id: 13, number: 'INV-2025-013', customer: 'PT Global Media', issueDate: '2025-06-25', category: 'Media', status: 'unpaid', total: 9300000, balance: 9300000 },
  { id: 14, number: 'INV-2025-014', customer: 'CV Mandiri Abadi', issueDate: '2025-06-28', category: 'Support', status: 'paid', total: 3700000, balance: 0, paymentDate: '2025-06-30' },
  
  // July 2025
  { id: 15, number: 'INV-2025-015', customer: 'PT Sinar Jaya', issueDate: '2025-07-02', category: 'Services', status: 'paid', total: 14800000, balance: 0, paymentDate: '2025-07-10' },
  { id: 16, number: 'INV-2025-016', customer: 'PT Nusantara Tech', issueDate: '2025-07-05', category: 'Software', status: 'paid', total: 19500000, balance: 0, paymentDate: '2025-07-12' },
  { id: 17, number: 'INV-2025-017', customer: 'CV Mandiri Abadi', issueDate: '2025-07-08', category: 'Consulting', status: 'unpaid', total: 7600000, balance: 7600000 },
  { id: 18, number: 'INV-2025-018', customer: 'PT Global Media', issueDate: '2025-07-10', category: 'Media', status: 'partial', total: 16400000, balance: 5200000, paymentDate: '2025-07-18' },
  { id: 19, number: 'INV-2025-019', customer: 'PT Sinar Jaya', issueDate: '2025-07-12', category: 'Services', status: 'paid', total: 8900000, balance: 0, paymentDate: '2025-07-20' },
  { id: 20, number: 'INV-2025-020', customer: 'PT Nusantara Tech', issueDate: '2025-07-15', category: 'Software', status: 'overdue', total: 25300000, balance: 25300000 },
  { id: 21, number: 'INV-2025-021', customer: 'CV Mandiri Abadi', issueDate: '2025-07-18', category: 'Support', status: 'paid', total: 4200000, balance: 0, paymentDate: '2025-07-25' },
  { id: 22, number: 'INV-2025-022', customer: 'PT Global Media', issueDate: '2025-07-22', category: 'Media', status: 'paid', total: 21600000, balance: 0, paymentDate: '2025-07-28' },
  { id: 23, number: 'INV-2025-023', customer: 'PT Sinar Jaya', issueDate: '2025-07-25', category: 'Consulting', status: 'unpaid', total: 12700000, balance: 12700000 },
  { id: 24, number: 'INV-2025-024', customer: 'PT Nusantara Tech', issueDate: '2025-07-28', category: 'Software', status: 'paid', total: 17800000, balance: 0, paymentDate: '2025-07-31' },
  
  // August 2025
  { id: 25, number: 'INV-2025-025', customer: 'CV Mandiri Abadi', issueDate: '2025-08-01', category: 'Services', status: 'paid', total: 10500000, balance: 0, paymentDate: '2025-08-08' },
  { id: 26, number: 'INV-2025-026', customer: 'PT Global Media', issueDate: '2025-08-03', category: 'Media', status: 'paid', total: 19200000, balance: 0, paymentDate: '2025-08-10' },
  { id: 27, number: 'INV-2025-027', customer: 'PT Sinar Jaya', issueDate: '2025-08-05', category: 'Consulting', status: 'partial', total: 13500000, balance: 6700000, paymentDate: '2025-08-12' },
  { id: 28, number: 'INV-2025-028', customer: 'PT Nusantara Tech', issueDate: '2025-08-08', category: 'Software', status: 'paid', total: 28400000, balance: 0, paymentDate: '2025-08-15' },
  { id: 29, number: 'INV-2025-029', customer: 'CV Mandiri Abadi', issueDate: '2025-08-10', category: 'Support', status: 'unpaid', total: 5600000, balance: 5600000 },
  { id: 30, number: 'INV-2025-030', customer: 'PT Global Media', issueDate: '2025-08-12', category: 'Media', status: 'paid', total: 24300000, balance: 0, paymentDate: '2025-08-18' },
  { id: 31, number: 'INV-2025-031', customer: 'PT Sinar Jaya', issueDate: '2025-08-15', category: 'Services', status: 'paid', total: 11800000, balance: 0, paymentDate: '2025-08-22' },
  { id: 32, number: 'INV-2025-032', customer: 'PT Nusantara Tech', issueDate: '2025-08-18', category: 'Software', status: 'overdue', total: 16900000, balance: 16900000 },
  { id: 33, number: 'INV-2025-033', customer: 'CV Mandiri Abadi', issueDate: '2025-08-20', category: 'Consulting', status: 'paid', total: 9200000, balance: 0, paymentDate: '2025-08-25' },
  { id: 34, number: 'INV-2025-034', customer: 'PT Global Media', issueDate: '2025-08-22', category: 'Media', status: 'unpaid', total: 14700000, balance: 14700000 },
  { id: 35, number: 'INV-2025-035', customer: 'PT Sinar Jaya', issueDate: '2025-08-25', category: 'Services', status: 'paid', total: 8300000, balance: 0, paymentDate: '2025-08-30' },
  
  // September 2025
  { id: 36, number: 'INV-2025-036', customer: 'PT Nusantara Tech', issueDate: '2025-09-02', category: 'Software', status: 'paid', total: 32100000, balance: 0, paymentDate: '2025-09-10' },
  { id: 37, number: 'INV-2025-037', customer: 'CV Mandiri Abadi', issueDate: '2025-09-05', category: 'Consulting', status: 'paid', total: 11400000, balance: 0, paymentDate: '2025-09-12' },
  { id: 38, number: 'INV-2025-038', customer: 'PT Global Media', issueDate: '2025-09-08', category: 'Media', status: 'partial', total: 22800000, balance: 8900000, paymentDate: '2025-09-15' },
  { id: 39, number: 'INV-2025-039', customer: 'PT Sinar Jaya', issueDate: '2025-09-10', category: 'Services', status: 'paid', total: 15600000, balance: 0, paymentDate: '2025-09-18' },
  { id: 40, number: 'INV-2025-040', customer: 'PT Nusantara Tech', issueDate: '2025-09-12', category: 'Software', status: 'unpaid', total: 19700000, balance: 19700000 },
  { id: 41, number: 'INV-2025-041', customer: 'CV Mandiri Abadi', issueDate: '2025-09-15', category: 'Support', status: 'paid', total: 6100000, balance: 0, paymentDate: '2025-09-22' },
  { id: 42, number: 'INV-2025-042', customer: 'PT Global Media', issueDate: '2025-09-18', category: 'Media', status: 'paid', total: 27500000, balance: 0, paymentDate: '2025-09-25' },
  { id: 43, number: 'INV-2025-043', customer: 'PT Sinar Jaya', issueDate: '2025-09-20', category: 'Consulting', status: 'overdue', total: 13900000, balance: 13900000 },
  { id: 44, number: 'INV-2025-044', customer: 'PT Nusantara Tech', issueDate: '2025-09-22', category: 'Software', status: 'paid', total: 24600000, balance: 0, paymentDate: '2025-09-28' },
  { id: 45, number: 'INV-2025-045', customer: 'CV Mandiri Abadi', issueDate: '2025-09-25', category: 'Services', status: 'unpaid', total: 7800000, balance: 7800000 },
  
  // October 2025
  { id: 46, number: 'INV-2025-046', customer: 'PT Global Media', issueDate: '2025-10-01', category: 'Media', status: 'paid', total: 29300000, balance: 0, paymentDate: '2025-10-08' },
  { id: 47, number: 'INV-2025-047', customer: 'PT Sinar Jaya', issueDate: '2025-10-03', category: 'Services', status: 'paid', total: 16200000, balance: 0, paymentDate: '2025-10-10' },
  { id: 48, number: 'INV-2025-048', customer: 'PT Nusantara Tech', issueDate: '2025-10-05', category: 'Software', status: 'partial', total: 35700000, balance: 12400000, paymentDate: '2025-10-12' },
  { id: 49, number: 'INV-2025-049', customer: 'CV Mandiri Abadi', issueDate: '2025-10-08', category: 'Consulting', status: 'paid', total: 12800000, balance: 0, paymentDate: '2025-10-15' },
  { id: 50, number: 'INV-2025-050', customer: 'PT Global Media', issueDate: '2025-10-10', category: 'Media', status: 'unpaid', total: 21400000, balance: 21400000 },
  { id: 51, number: 'INV-2025-051', customer: 'PT Sinar Jaya', issueDate: '2025-10-12', category: 'Support', status: 'paid', total: 7400000, balance: 0, paymentDate: '2025-10-18' },
  { id: 52, number: 'INV-2025-052', customer: 'PT Nusantara Tech', issueDate: '2025-10-15', category: 'Software', status: 'paid', total: 26900000, balance: 0, paymentDate: '2025-10-22' },
  { id: 53, number: 'INV-2025-053', customer: 'CV Mandiri Abadi', issueDate: '2025-10-18', category: 'Services', status: 'overdue', total: 9800000, balance: 9800000 },
  { id: 54, number: 'INV-2025-054', customer: 'PT Global Media', issueDate: '2025-10-20', category: 'Media', status: 'paid', total: 31200000, balance: 0, paymentDate: '2025-10-28' },
  { id: 55, number: 'INV-2025-055', customer: 'PT Sinar Jaya', issueDate: '2025-10-22', category: 'Consulting', status: 'unpaid', total: 14500000, balance: 14500000 },
  { id: 56, number: 'INV-2025-056', customer: 'PT Nusantara Tech', issueDate: '2025-10-25', category: 'Software', status: 'paid', total: 28700000, balance: 0, paymentDate: '2025-10-30' },
  
  // November 2025
  { id: 57, number: 'INV-2025-057', customer: 'CV Mandiri Abadi', issueDate: '2025-11-01', category: 'Services', status: 'paid', total: 11900000, balance: 0, paymentDate: '2025-11-05' },
  { id: 58, number: 'INV-2025-058', customer: 'PT Global Media', issueDate: '2025-11-03', category: 'Media', status: 'unpaid', total: 25600000, balance: 25600000 },
  { id: 59, number: 'INV-2025-059', customer: 'PT Sinar Jaya', issueDate: '2025-11-05', category: 'Consulting', status: 'paid', total: 17300000, balance: 0, paymentDate: '2025-11-07' },
  { id: 60, number: 'INV-2025-060', customer: 'PT Nusantara Tech', issueDate: '2025-11-06', category: 'Software', status: 'unpaid', total: 33500000, balance: 33500000 },
]
