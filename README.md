# ERP Welcomplay

## Setup

### 1. Install dependencies
```bash
pnpm install
```

### 2. Setup environment
Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/erp_db"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Run database migrations
```bash
# Apply all pending migrations to your database
npx prisma migrate deploy

# OR if you want to reset and apply all migrations fresh
npx prisma db push
```

### 4. Seed the database (optional)
```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### 5. Start development server
```bash
pnpm dev
```

## Database Migrations

When pulling new changes that include new migrations, always run:
```bash
npx prisma migrate deploy
```

### Recent Migrations
- `20260227300000_add_pos_models` - Adds POS module tables: `warehouse`, `pos_order`, `pos_order_item`, `barcode_setting`

## POS Module

The POS (Point of Sale) module includes:
- **Warehouse Management** - `/pos/warehouse` - CRUD for warehouse locations
- **POS Cashier** - `/pos/sales` - Full POS interface with product search, cart, payment
- **POS Summary** - `/pos/summary` - List of all POS transactions
- **POS Reports** - `/pos/reports` - Analytics (daily/monthly/warehouse/vs-purchase)
- **Print Barcode** - `/pos/print-barcode` - Product barcode printing
- **Print Settings** - `/pos/print-settings` - Barcode and print configuration

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pos/warehouses` | GET, POST | List/create warehouses |
| `/api/pos/warehouses/[id]` | GET, PATCH, DELETE | Warehouse CRUD |
| `/api/pos/search-products` | GET | Search products for POS |
| `/api/pos/product-categories` | GET | Product categories for filter |
| `/api/pos/cart/discount` | POST | Calculate cart with discount |
| `/api/pos/orders` | GET, POST | List/create POS orders |
| `/api/pos/orders/[id]` | GET, DELETE | Order detail |
| `/api/pos/barcode-settings` | GET, POST | Barcode settings |
| `/api/pos/reports` | GET | POS report data |
