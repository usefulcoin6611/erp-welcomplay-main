/** Mock data untuk Training & Trainer - reference-erp */

export type Training = {
  id: string
  branch: string
  trainingType: string
  status: string
  employee: string
  trainer: string
  startDate: string
  endDate: string
  cost: number
  description?: string
  createdAt?: string
}

/** reference-erp Training::$Status */
export const TRAINING_STATUS_OPTIONS = ['Pending', 'Started', 'Completed', 'Terminated'] as const

/** reference-erp Training::$performance */
export const TRAINING_PERFORMANCE_OPTIONS = [
  'Not Concluded',
  'Satisfactory',
  'Average',
  'Poor',
  'Excellent',
] as const

export type Trainer = {
  id: string
  branch: string
  firstName: string
  lastName: string
  contact: string
  email: string
  expertise: string
}

const trainings: Training[] = [
  {
    id: '1',
    branch: 'Head Office',
    trainingType: 'Technical Skills',
    status: 'Completed',
    employee: 'John Doe',
    trainer: 'Sarah Johnson',
    startDate: '2024-01-15',
    endDate: '2024-01-19',
    cost: 5000000,
    description: 'Pelatihan technical skills untuk pengembangan kemampuan programming.',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    branch: 'Branch A',
    trainingType: 'Leadership Development',
    status: 'Started',
    employee: 'Jane Smith',
    trainer: 'Michael Brown',
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    cost: 7500000,
    description: 'Program pengembangan kepemimpinan.',
    createdAt: '2024-01-25',
  },
  {
    id: '3',
    branch: 'Head Office',
    trainingType: 'Customer Service',
    status: 'Pending',
    employee: 'Bob Wilson',
    trainer: 'Emily Davis',
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    cost: 3000000,
    description: 'Pelatihan layanan pelanggan.',
    createdAt: '2024-02-20',
  },
]

const trainers: Trainer[] = [
  {
    id: '1',
    branch: 'Head Office',
    firstName: 'Sarah',
    lastName: 'Johnson',
    contact: '+62 812-3456-7890',
    email: 'sarah.johnson@company.com',
    expertise: 'Technical Skills, Programming',
  },
  {
    id: '2',
    branch: 'Branch A',
    firstName: 'Michael',
    lastName: 'Brown',
    contact: '+62 813-9876-5432',
    email: 'michael.brown@company.com',
    expertise: 'Leadership, Management',
  },
  {
    id: '3',
    branch: 'Head Office',
    firstName: 'Emily',
    lastName: 'Davis',
    contact: '+62 821-1234-5678',
    email: 'emily.davis@company.com',
    expertise: 'Customer Service, Communication',
  },
]

export function getTrainingById(id: string): Training | null {
  return trainings.find((t) => t.id === id) ?? null
}

export function getTrainerById(id: string): Trainer | null {
  return trainers.find((t) => t.id === id) ?? null
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100'
    case 'Started':
      return 'bg-blue-50 text-blue-700 border-blue-100'
    case 'In Progress':
      return 'bg-blue-50 text-blue-700 border-blue-100'
    case 'Pending':
      return 'bg-amber-50 text-amber-700 border-amber-100'
    case 'Terminated':
      return 'bg-red-50 text-red-700 border-red-100'
    case 'Cancelled':
      return 'bg-red-50 text-red-700 border-red-100'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-100'
  }
}
