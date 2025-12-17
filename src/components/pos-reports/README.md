# POS Reports

Comprehensive POS reporting system with warehouse, purchase, sales, and profitability analysis.

## Features

### 1. Warehouse Report
- **Overview**: Product distribution across warehouse locations
- **Visualizations**: Area chart showing product count by warehouse
- **Summary Cards**: Total warehouses, total products, and report overview
- **Actions**: PDF download

### 2. Purchase Daily/Monthly Report
- **Tabs**: Daily and Monthly views
- **Filters**:
  - Date range (start/end date for daily, start/end month for monthly)
  - Warehouse selection
  - Vendor selection
- **Visualizations**: Area chart showing purchase trends
- **Summary Cards**: Report type and selected warehouse (if filtered)
- **Actions**: Apply filters, reset filters, PDF download

### 3. POS Daily/Monthly Report
- **Tabs**: Daily and Monthly views
- **Filters**:
  - Date range (start/end date for daily, start/end month for monthly)
  - Warehouse selection
  - Customer selection
- **Visualizations**: Area chart showing sales trends
- **Summary Cards**: Report type and selected warehouse (if filtered)
- **Actions**: Apply filters, reset filters, PDF download

### 4. POS VS Purchase Report
- **Purpose**: Profitability analysis comparing sales revenue against purchase costs
- **Filters**: Year selection
- **Visualizations**: 
  - Area chart showing monthly profit (Profit = POS - Purchase)
  - Data table with detailed breakdown by month
- **Summary Cards**: Report type and duration
- **Actions**: Apply filters, reset filters, PDF download

## Components Structure

```
pos-reports/
├── index.ts                          # Main exports
├── warehouse/
│   ├── WarehouseTab.tsx             # Warehouse report component
│   └── index.ts
├── purchase/
│   ├── PurchaseTab.tsx              # Purchase daily/monthly report
│   └── index.ts
├── pos/
│   ├── POSTab.tsx                   # POS daily/monthly report
│   └── index.ts
└── pos-vs-purchase/
    ├── POSVsPurchaseTab.tsx         # POS vs Purchase comparison
    └── index.ts
```

## Usage

The main page is located at `/src/app/pos/reports/page.tsx` and uses lazy loading for performance optimization.

```tsx
import POSReportsPage from '@/app/pos/reports/page'

// Access via route: /pos/reports
```

## Design Patterns

- **Lazy Loading**: All tab components are loaded dynamically to improve initial page load
- **Suspense Fallbacks**: Skeleton loaders for smooth UX during component loading
- **Consistent Spacing**: Following best practices with standardized spacing and sizing
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Dark Mode Support**: All components support dark mode
- **Accessibility**: Semantic HTML, ARIA attributes, keyboard navigation

## Charts

All charts use ApexCharts with the following configuration:
- **Type**: Area charts for trend visualization
- **Height**: Consistent 320px height
- **Colors**: Brand colors (#6fd944 for primary, #ffa21d for profit)
- **Features**: Drop shadows, smooth curves, tooltips with currency formatting
- **Responsive**: Auto-resize based on container width

## Data Flow

Currently using mock data. To integrate with real API:

1. Replace mock data generation with API calls
2. Add loading states during data fetching
3. Implement error handling
4. Add data caching strategy (e.g., React Query or SWR)

## Related Routes

- Main page: `/pos/reports`
- Sidebar navigation: See `src/components/app-sidebar.tsx`
  - Warehouse Report: `/pos/reports/warehouse`
  - Purchase Daily/Monthly Report: `/pos/reports/purchase-daily`
  - POS Daily/Monthly Report: `/pos/reports/pos-daily`
  - POS VS Purchase Report: `/pos/reports/pos-vs-purchase`

## Best Practices Applied

1. **Component Composition**: Modular tab-based structure
2. **Type Safety**: Full TypeScript coverage
3. **Performance**: Dynamic imports, lazy loading, memoization
4. **UX**: Loading states, skeleton loaders, tooltips, responsive filters
5. **Accessibility**: Semantic HTML, ARIA labels, keyboard support
6. **Maintainability**: Clear file structure, consistent naming, separation of concerns
