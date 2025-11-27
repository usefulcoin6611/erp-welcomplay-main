export interface ProductStock {
  id: string
  name: string
  sku: string
  category: string
  unit: string
  quantity: number
  minStock: number
  maxStock: number
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  lastUpdated: string
}

export const mockProductStocks: ProductStock[] = [
  {
    id: '1',
    name: 'Laptop Dell XPS 13',
    sku: 'LAP-DELL-001',
    category: 'Electronics',
    unit: 'Pcs',
    quantity: 45,
    minStock: 10,
    maxStock: 100,
    status: 'in-stock',
    lastUpdated: '2025-11-20',
  },
  {
    id: '2',
    name: 'Office Chair Ergonomic',
    sku: 'FUR-CHAIR-002',
    category: 'Furniture',
    unit: 'Pcs',
    quantity: 8,
    minStock: 10,
    maxStock: 50,
    status: 'low-stock',
    lastUpdated: '2025-11-19',
  },
  {
    id: '3',
    name: 'Printer HP LaserJet',
    sku: 'PRT-HP-003',
    category: 'Electronics',
    unit: 'Pcs',
    quantity: 0,
    minStock: 5,
    maxStock: 30,
    status: 'out-of-stock',
    lastUpdated: '2025-11-18',
  },
  {
    id: '4',
    name: 'Wireless Mouse Logitech',
    sku: 'ACC-MOU-004',
    category: 'Accessories',
    unit: 'Pcs',
    quantity: 150,
    minStock: 50,
    maxStock: 200,
    status: 'in-stock',
    lastUpdated: '2025-11-21',
  },
  {
    id: '5',
    name: 'USB Flash Drive 32GB',
    sku: 'ACC-USB-005',
    category: 'Accessories',
    unit: 'Pcs',
    quantity: 7,
    minStock: 20,
    maxStock: 100,
    status: 'low-stock',
    lastUpdated: '2025-11-22',
  },
  {
    id: '6',
    name: 'Monitor Samsung 24"',
    sku: 'MON-SAM-006',
    category: 'Electronics',
    unit: 'Pcs',
    quantity: 32,
    minStock: 10,
    maxStock: 50,
    status: 'in-stock',
    lastUpdated: '2025-11-23',
  },
  {
    id: '7',
    name: 'Keyboard Mechanical',
    sku: 'ACC-KEY-007',
    category: 'Accessories',
    unit: 'Pcs',
    quantity: 0,
    minStock: 15,
    maxStock: 60,
    status: 'out-of-stock',
    lastUpdated: '2025-11-17',
  },
  {
    id: '8',
    name: 'Desk Lamp LED',
    sku: 'FUR-LAMP-008',
    category: 'Furniture',
    unit: 'Pcs',
    quantity: 25,
    minStock: 10,
    maxStock: 40,
    status: 'in-stock',
    lastUpdated: '2025-11-24',
  },
  {
    id: '9',
    name: 'Paper A4 80gsm',
    sku: 'OFF-PAP-009',
    category: 'Office Supplies',
    unit: 'Ream',
    quantity: 5,
    minStock: 20,
    maxStock: 100,
    status: 'low-stock',
    lastUpdated: '2025-11-20',
  },
  {
    id: '10',
    name: 'Whiteboard Marker',
    sku: 'OFF-MAR-010',
    category: 'Office Supplies',
    unit: 'Box',
    quantity: 18,
    minStock: 10,
    maxStock: 50,
    status: 'in-stock',
    lastUpdated: '2025-11-25',
  },
]

export const availableCategories = [
  'All',
  'Electronics',
  'Furniture',
  'Accessories',
  'Office Supplies',
]

export const availableStatuses = ['all', 'in-stock', 'low-stock', 'out-of-stock'] as const

export type StockStatus = typeof availableStatuses[number]

export const statusStyles = {
  'in-stock': {
    label: 'In Stock',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  'low-stock': {
    label: 'Low Stock',
    className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  },
  'out-of-stock': {
    label: 'Out of Stock',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
}
