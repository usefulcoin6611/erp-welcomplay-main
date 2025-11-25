// Sales Report Data Constants

export const SALES_BY_ITEM_DATA = [
  { item: 'Laptop Pro 15"', quantity: 48, revenue: 120000000, avgPrice: 2500000, status: 'Top Seller' },
  { item: 'Office Chair', quantity: 96, revenue: 45600000, avgPrice: 475000, status: 'Trending' },
  { item: 'Wireless Mouse', quantity: 210, revenue: 18900000, avgPrice: 90000, status: 'Steady' },
  { item: 'Cloud Storage Pro', quantity: 32, revenue: 89600000, avgPrice: 2800000, status: 'Premium' },
  { item: 'Mechanical Keyboard', quantity: 87, revenue: 26100000, avgPrice: 300000, status: 'Trending' },
  { item: 'USB-C Hub', quantity: 145, revenue: 14500000, avgPrice: 100000, status: 'Steady' },
  { item: 'Webcam HD', quantity: 62, revenue: 24800000, avgPrice: 400000, status: 'Top Seller' },
  { item: 'Monitor 27"', quantity: 38, revenue: 95000000, avgPrice: 2500000, status: 'Premium' },
  { item: 'Standing Desk', quantity: 29, revenue: 87000000, avgPrice: 3000000, status: 'Premium' },
  { item: 'Headset Wireless', quantity: 156, revenue: 31200000, avgPrice: 200000, status: 'Trending' },
  { item: 'Tablet 10"', quantity: 44, revenue: 132000000, avgPrice: 3000000, status: 'Top Seller' },
  { item: 'External SSD 1TB', quantity: 78, revenue: 39000000, avgPrice: 500000, status: 'Steady' },
  { item: 'Docking Station', quantity: 35, revenue: 52500000, avgPrice: 1500000, status: 'Premium' },
  { item: 'Ergonomic Mouse', quantity: 198, revenue: 29700000, avgPrice: 150000, status: 'Trending' },
  { item: 'Laptop Stand', quantity: 124, revenue: 18600000, avgPrice: 150000, status: 'Steady' },
  { item: 'Wireless Charger', quantity: 167, revenue: 25050000, avgPrice: 150000, status: 'Trending' },
  { item: 'Drawing Tablet', quantity: 41, revenue: 82000000, avgPrice: 2000000, status: 'Premium' },
  { item: 'Portable Monitor', quantity: 53, revenue: 79500000, avgPrice: 1500000, status: 'Top Seller' },
  { item: 'USB Flash Drive 64GB', quantity: 289, revenue: 14450000, avgPrice: 50000, status: 'Steady' },
  { item: 'Cable Management Kit', quantity: 142, revenue: 7100000, avgPrice: 50000, status: 'Steady' },
]

export const SALES_BY_CUSTOMER_DATA = [
  { customer: 'PT. Astra', orders: 32, revenue: 72000000, avgOrder: 2250000, priority: 'Strategic' },
  { customer: 'CV. Mitra Karya', orders: 18, revenue: 28500000, avgOrder: 1583000, priority: 'Growth' },
  { customer: 'UD. Sumber Jaya', orders: 24, revenue: 31200000, avgOrder: 1300000, priority: 'Stable' },
  { customer: 'PT. Digital Nusantara', orders: 41, revenue: 91500000, avgOrder: 2232000, priority: 'Premium' },
  { customer: 'PT. Telkom Indonesia', orders: 38, revenue: 114000000, avgOrder: 3000000, priority: 'Strategic' },
  { customer: 'CV. Jaya Abadi', orders: 22, revenue: 33000000, avgOrder: 1500000, priority: 'Growth' },
  { customer: 'PT. Bank Mandiri', orders: 45, revenue: 135000000, avgOrder: 3000000, priority: 'Strategic' },
  { customer: 'UD. Sejahtera', orders: 15, revenue: 15000000, avgOrder: 1000000, priority: 'Stable' },
  { customer: 'PT. Garuda Indonesia', orders: 29, revenue: 87000000, avgOrder: 3000000, priority: 'Premium' },
  { customer: 'CV. Maju Jaya', orders: 19, revenue: 28500000, avgOrder: 1500000, priority: 'Growth' },
  { customer: 'PT. Pertamina', orders: 52, revenue: 156000000, avgOrder: 3000000, priority: 'Strategic' },
  { customer: 'UD. Makmur', orders: 13, revenue: 13000000, avgOrder: 1000000, priority: 'Stable' },
  { customer: 'PT. Unilever Indonesia', orders: 36, revenue: 108000000, avgOrder: 3000000, priority: 'Premium' },
  { customer: 'CV. Berkah Jaya', orders: 21, revenue: 31500000, avgOrder: 1500000, priority: 'Growth' },
  { customer: 'PT. Indofood', orders: 43, revenue: 129000000, avgOrder: 3000000, priority: 'Strategic' },
  { customer: 'UD. Rejeki', orders: 16, revenue: 16000000, avgOrder: 1000000, priority: 'Stable' },
  { customer: 'PT. XL Axiata', orders: 34, revenue: 102000000, avgOrder: 3000000, priority: 'Premium' },
  { customer: 'CV. Sukses Mandiri', orders: 20, revenue: 30000000, avgOrder: 1500000, priority: 'Growth' },
  { customer: 'PT. Astra Honda Motor', orders: 48, revenue: 144000000, avgOrder: 3000000, priority: 'Strategic' },
  { customer: 'UD. Barokah', orders: 14, revenue: 14000000, avgOrder: 1000000, priority: 'Stable' },
]

export type SalesByItemRow = typeof SALES_BY_ITEM_DATA[0]
export type SalesByCustomerRow = typeof SALES_BY_CUSTOMER_DATA[0]
