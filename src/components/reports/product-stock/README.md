# Product Stock Report

Implementasi lengkap untuk Product Stock Report tab di aplikasi ERP.

## Struktur File

```
product-stock/
├── ProductStockTab.tsx          # Main component
├── ProductStockFilters.tsx      # Filter component
├── ProductStockTable.tsx        # Table component
├── constants.ts                 # Data types & mock data
├── hooks/
│   └── useProductStockData.ts  # Custom hook for data management
└── index.ts                     # Exports
```

## Fitur

### 1. Filter Section
- **Category Filter**: Filter produk berdasarkan kategori (Electronics, Furniture, Accessories, Office Supplies)
- **Status Filter**: Filter berdasarkan status stok (In Stock, Low Stock, Out of Stock)
- **Action Buttons**:
  - Apply: Terapkan filter
  - Reset: Reset semua filter
  - Export: Export data ke spreadsheet
  - Download: Download report

### 2. Statistics Cards
- **Total Products**: Jumlah total produk
- **In Stock**: Jumlah produk dengan stok tersedia
- **Low Stock**: Jumlah produk dengan stok rendah (di bawah minimum)
- **Out of Stock**: Jumlah produk yang habis

### 3. Product Table
Menampilkan informasi produk:
- Name: Nama produk
- SKU: Stock Keeping Unit
- Category: Kategori produk
- Unit: Unit pengukuran (Pcs, Box, Ream, dll)
- Current Quantity: Jumlah stok saat ini
- Min Stock: Minimum stok yang harus tersedia
- Max Stock: Maximum kapasitas stok
- Status: Status stok (dengan badge berwarna)
- Last Updated: Tanggal terakhir update
- Action: Button untuk update quantity

### 4. Pagination
- Page size selector (10, 20, 50, 100)
- Navigation controls
- Total count indicator

## Data Structure

### ProductStock Interface
```typescript
interface ProductStock {
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
```

## Status Logic
- **In Stock**: quantity > minStock
- **Low Stock**: 0 < quantity ≤ minStock
- **Out of Stock**: quantity = 0

## Mock Data
File `constants.ts` berisi 10 produk contoh dengan berbagai status untuk testing dan development.

## Styling
Mengikuti pattern yang sama dengan tab lain:
- Consistent spacing dan padding
- Responsive layout
- Shadow-none cards
- Blue accent color untuk actions
- Status badges dengan warna sesuai kondisi:
  - Green: In Stock
  - Yellow: Low Stock
  - Red: Out of Stock

## Usage

```tsx
import { ProductStockTab } from '@/components/reports/product-stock'

function ReportsPage() {
  return <ProductStockTab />
}
```

## Referensi
Implementasi mengacu pada:
- `/reference-erp/resources/views/productstock/index.blade.php`
- Pattern dari Invoice Summary tab untuk konsistensi UI/UX
