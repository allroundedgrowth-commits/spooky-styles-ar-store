# Database Setup

This directory contains database migrations and seed data for the Spooky Styles AR Store.

## Structure

```
db/
├── migrations/          # SQL migration files
│   ├── 001_create_users_table.sql
│   ├── 002_create_products_table.sql
│   ├── 003_create_product_colors_table.sql
│   ├── 004_create_orders_table.sql
│   ├── 005_create_order_items_table.sql
│   └── 006_create_costume_inspirations_tables.sql
├── migrate.ts          # Migration runner script
├── seed.ts             # Seed data script
└── README.md           # This file
```

## Database Schema

### Tables

1. **users** - User accounts with authentication
   - Indexed on: email
   - Features: account lockout, password hashing

2. **products** - Product catalog (wigs and accessories)
   - Indexed on: category, theme, stock_quantity
   - Features: promotional pricing, stock tracking

3. **product_colors** - Available colors for each product
   - Indexed on: product_id
   - Constraint: unique (product_id, color_name)

4. **orders** - Customer orders
   - Indexed on: status, user_id, created_at
   - Features: Stripe integration, order status tracking

5. **order_items** - Line items for each order
   - Indexed on: order_id, product_id
   - Features: customization storage (JSONB)

6. **costume_inspirations** - Curated costume combinations
   - Junction table: costume_inspiration_products
   - Features: display ordering, product associations

## Setup Instructions

### Prerequisites

1. Ensure PostgreSQL is running (via Docker Compose or local installation)
2. Copy `.env.example` to `.env` and configure database credentials

### Running Migrations

```bash
# Run all migrations
npm run db:migrate

# Or using tsx directly
tsx src/db/migrate.ts
```

### Seeding Data

```bash
# Seed the database with sample data
npm run db:seed

# Or using tsx directly
tsx src/db/seed.ts
```

### Complete Setup

```bash
# Run migrations and seed in one command
npm run db:setup
```

## Sample Data

The seed script includes:

- **12 Products**: 6 wigs and 6 accessories across 5 Halloween themes
- **35 Color Options**: Multiple color variations for each wig
- **12 Costume Inspirations**: Curated costume combinations

### Themes
- Witch
- Zombie
- Vampire
- Skeleton
- Ghost

### Product Categories
- Wigs (customizable with colors)
- Accessories (hats, fangs, crowns, veils, etc.)

## Database Connection

The database connection pool is configured in `src/config/database.ts` with:
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

## Indexes

Performance indexes are created for:
- User email lookups
- Product filtering by category and theme
- Order status queries
- Product color associations
- Costume inspiration product relationships

## Notes

- All tables use UUID primary keys
- Timestamps are automatically managed with triggers
- Foreign keys use appropriate CASCADE/SET NULL behaviors
- Check constraints ensure data integrity (positive prices, valid statuses)
