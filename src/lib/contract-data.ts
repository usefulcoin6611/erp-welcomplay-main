export type Contract = {
  id: string
  contractNumber: string
  subject: string
  client: string
  project: string
  projectId?: string | null
  type: string
  value: number
  startDate: string
  endDate: string
  status: string
  description?: string
}

export const contracts: Contract[] = [
  {
    id: 'CTR-2025-001',
    contractNumber: 'CTR-001',
    subject: 'Implementasi ERP PT Maju Jaya',
    client: 'PT Maju Jaya',
    project: 'ERP Implementation Project',
    type: 'Implementation',
    value: 350_000_000,
    startDate: '2025-11-01',
    endDate: '2026-01-31',
    status: 'accept',
    description: 'Kontrak implementasi ERP full module selama 3 bulan.',
  },
  {
    id: 'CTR-2025-002',
    contractNumber: 'CTR-002',
    subject: 'Maintenance CRM CV Kreatif Digital',
    client: 'CV Kreatif Digital',
    project: '-',
    type: 'Support',
    value: 120_000_000,
    startDate: '2025-11-10',
    endDate: '2026-11-09',
    status: 'accept',
    description: 'Maintenance dan support tahunan untuk modul CRM.',
  },
  {
    id: 'CTR-2025-003',
    contractNumber: 'CTR-003',
    subject: 'Development Mobile App PT Teknologi',
    client: 'PT Teknologi',
    project: 'Mobile App Development',
    type: 'Development',
    value: 500_000_000,
    startDate: '2025-12-01',
    endDate: '2026-06-30',
    status: 'accept',
    description: 'Pengembangan aplikasi mobile untuk platform iOS dan Android.',
  },
  {
    id: 'CTR-2025-004',
    contractNumber: 'CTR-004',
    subject: 'Cloud Migration Services',
    client: 'PT Digital Solutions',
    project: 'Cloud Migration',
    type: 'Migration',
    value: 250_000_000,
    startDate: '2025-10-15',
    endDate: '2026-04-14',
    status: 'pending',
    description: 'Migrasi infrastruktur ke cloud dan optimasi.',
  },
  {
    id: 'CTR-2025-005',
    contractNumber: 'CTR-005',
    subject: 'Security Audit & Compliance',
    client: 'PT Keamanan Data',
    project: 'Security Audit',
    type: 'Audit',
    value: 180_000_000,
    startDate: '2025-09-01',
    endDate: '2025-12-31',
    status: 'accept',
    description: 'Audit keamanan dan compliance standar industri.',
  },
  {
    id: 'CTR-2025-006',
    contractNumber: 'CTR-006',
    subject: 'Database Optimization',
    client: 'CV Optimasi Sistem',
    project: '-',
    type: 'Optimization',
    value: 95_000_000,
    startDate: '2025-11-20',
    endDate: '2026-02-19',
    status: 'accept',
    description: 'Optimasi database dan tuning performa.',
  },
  {
    id: 'CTR-2025-007',
    contractNumber: 'CTR-007',
    subject: 'E-Commerce Platform Development',
    client: 'PT Retail Online',
    project: 'E-Commerce Platform',
    type: 'Development',
    value: 750_000_000,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'pending',
    description: 'Pengembangan platform e-commerce lengkap.',
  },
  {
    id: 'CTR-2025-008',
    contractNumber: 'CTR-008',
    subject: 'IT Infrastructure Setup',
    client: 'PT Infrastruktur',
    project: 'Infrastructure Setup',
    type: 'Infrastructure',
    value: 420_000_000,
    startDate: '2025-10-01',
    endDate: '2026-03-31',
    status: 'accept',
    description: 'Setup infrastruktur IT dan jaringan.',
  },
  {
    id: 'CTR-2025-009',
    contractNumber: 'CTR-009',
    subject: 'Training & Consultation',
    client: 'PT Pelatihan',
    project: '-',
    type: 'Training',
    value: 75_000_000,
    startDate: '2025-11-15',
    endDate: '2026-01-14',
    status: 'accept',
    description: 'Pelatihan dan konsultasi teknis.',
  },
  {
    id: 'CTR-2025-010',
    contractNumber: 'CTR-010',
    subject: 'System Integration Services',
    client: 'PT Integrasi Sistem',
    project: 'System Integration',
    type: 'Integration',
    value: 320_000_000,
    startDate: '2026-02-01',
    endDate: '2026-08-31',
    status: 'pending',
    description: 'Integrasi sistem dan API dengan pihak ketiga.',
  },
]

export function getContractById(id: string): Contract | undefined {
  return contracts.find((c) => c.id === id)
}

export function getContractStatusDisplay(status: string): string {
  switch (status) {
    case 'accept':
      return 'Accepted'
    case 'pending':
      return 'Pending'
    default:
      return status
  }
}

export function getContractStatusBadgeClass(status: string): string {
  switch (status) {
    case 'accept':
      return 'bg-green-100 text-green-700'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export type ContractAttachment = {
  id: string
  name: string
  size?: string
}

export type ContractComment = {
  id: string
  comment: string
  user: string
  created_at: string
}

export type ContractNote = {
  id: string
  notes: string
  user: string
  created_at: string
}

const mockAttachmentsByContract: Record<string, ContractAttachment[]> = {
  'CTR-2025-001': [
    { id: 'a1', name: 'SOW-ERP-Maju-Jaya.pdf', size: '1.2 MB' },
    { id: 'a2', name: 'Lampiran-Schedule.xlsx', size: '0.3 MB' },
  ],
}

const mockCommentsByContract: Record<string, ContractComment[]> = {
  'CTR-2025-001': [
    { id: 'c1', comment: 'Mohon konfirmasi timeline fase 2.', user: 'Admin', created_at: '2 hari yang lalu' },
  ],
}

const mockNotesByContract: Record<string, ContractNote[]> = {
  'CTR-2025-001': [
    { id: 'n1', notes: 'Kick-off meeting dijadwalkan minggu depan.', user: 'Admin', created_at: '1 minggu yang lalu' },
  ],
}

export function getContractAttachments(contractId: string): ContractAttachment[] {
  return mockAttachmentsByContract[contractId] ?? []
}

export function getContractComments(contractId: string): ContractComment[] {
  return mockCommentsByContract[contractId] ?? []
}

export function getContractNotes(contractId: string): ContractNote[] {
  return mockNotesByContract[contractId] ?? []
}

export const CONTRACT_STATUS_OPTIONS = ['accept', 'pending'] as const
