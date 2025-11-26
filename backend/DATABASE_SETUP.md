# Database Setup Guide

This guide will help you set up the PostgreSQL database for the Spooky Styles AR Store.

## Quick Start

### 1. Start PostgreSQL (Docker Compose)

From the project root:

```bash
docker-compose up -d postgres
```

This will start PostgreSQL on `localhost:5432` with:
- Database: `spooky_styles_db`
- User: `spooky_user`
- Password: `spooky_pass`

### 2. Test Database Connection

```bash
cd backend
npm run db:test
```

You should see:
```
🎃 Testing database connection...
✅ Database connection successful!
```

### 3. Run Migrations

```bash
npm run db:migrate
```

This creates all database tables with proper indexes and constraints.

### 4. Seed Sample Data

```bash
npm run db:seed
```

This populates the database with:
- 12 Halloween-themed products (6 wigs + 6 accessories)
- 35 color variations
- 12 costume inspiration combinations

### 5. Complete Setup (All-in-One)

```bash
npm run db:setup
```

This runs both migrations and seeding in one command.

## Database Schema Overview

### Core Tables

#### users
- User authentication and account management
- Password hashing with bcrypt
- Account lockout after failed login attempts
- **Index**: email

#### products
- Product catalog (wigs and accessories)
- Stock quantity tracking
- Promotional pricing support
- **Indexes**: category, theme, stock_quantity

#### product_colors
- Color options for customizable products
- Hex color codes for AR rendering
- **Index**: product_id

#### orders
- Customer order records
- Stripe payment integration
- Order status tracking (pending, processing, shipped, delivered, cancelled)
- **Indexes**: status, user_id, created_at

#### order_items
- Line items for each order
- JSONB field for customizations (colors, accessories)
- **Indexes**: order_id, product_id

#### costume_inspirations
- Curated costume combinations
- Multiple products per inspiration
- Display ordering for products

## Sample Data Details

### Products by Theme

**Witch Theme:**
- Witch's Midnight Cascade (wig) - $29.99 → $24.99
- Enchanted Forest Green (wig) - $33.99
- Classic Witch Hat (accessory) - $14.99 → $11.99

**Zombie Theme:**
- Zombie Decay Dreads (wig) - $34.99
- Zombie Brain Headband (accessory) - $12.99 → $9.99

**Vampire Theme:**
- Vampire Crimson Elegance (wig) - $39.99 → $32.99
- Vampire Fangs Deluxe (accessory) - $9.99
- Bat Wing Ears (accessory) - $8.99

**Skeleton Theme:**
- Skeleton Bone White (wig) - $27.99
- Skeleton Crown (accessory) - $16.99

**Ghost Theme:**
- Ghostly Ethereal Waves (wig) - $31.99 → $26.99
- Ghostly Veil (accessory) - $13.99 → $10.99

### Color Options

Each wig includes 5 color variations:
- Witch's Midnight Cascade: Midnight Black, Purple Haze, Deep Violet, Raven Black, Twilight Purple
- Zombie Decay Dreads: Decay Green, Rotting Brown, Moldy Gray, Corpse Gray, Toxic Green
- Vampire Crimson Elegance: Blood Red, Crimson Night, Burgundy, Ruby Red, Wine Red
- Skeleton Bone White: Bone White, Ivory, Aged Bone, Pearl White, Bleached
- Ghostly Ethereal Waves: Spirit White, Phantom Gray, Misty Blue, Spectral Silver, Moonlight
- Enchanted Forest Green: Forest Green, Emerald, Moss Green, Dark Green, Jade

### Costume Inspirations

12 pre-designed costume combinations:
1. Classic Witch Ensemble
2. Elegant Vampire
3. Undead Horror
4. Skeleton Queen
5. Ethereal Spirit
6. Forest Enchantress
7. Gothic Vampire Lord
8. Spectral Bride
9. Bone Witch
10. Zombie Royalty
11. Crimson Witch
12. Vampire Phantom

## Database Connection Configuration

Connection pool settings (in `src/config/database.ts`):
- Max connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

Environment variables (in `.env`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spooky_styles_db
DB_USER=spooky_user
DB_PASSWORD=spooky_pass
```

## Troubleshooting

### Connection Refused

If you get "connection refused" errors:

1. Check if PostgreSQL is running:
   ```bash
   docker ps | grep postgres
   ```

2. Start PostgreSQL if not running:
   ```bash
   docker-compose up -d postgres
   ```

3. Check PostgreSQL logs:
   ```bash
   docker logs spooky-styles-postgres
   ```

### Migration Errors

If migrations fail:

1. Check if tables already exist:
   ```bash
   docker exec -it spooky-styles-postgres psql -U spooky_user -d spooky_styles_db -c "\dt"
   ```

2. Drop all tables to start fresh (⚠️ WARNING: This deletes all data):
   ```bash
   docker exec -it spooky-styles-postgres psql -U spooky_user -d spooky_styles_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
   ```

3. Re-run migrations:
   ```bash
   npm run db:migrate
   ```

### Seed Data Issues

If seeding fails:

1. Ensure migrations have been run first
2. Check if data already exists (seeding will fail on duplicate entries)
3. Clear existing data if needed (see migration errors above)

## Manual Database Access

### Using Docker

```bash
# Connect to PostgreSQL
docker exec -it spooky-styles-postgres psql -U spooky_user -d spooky_styles_db

# List all tables
\dt

# Describe a table
\d products

# Query data
SELECT * FROM products LIMIT 5;

# Exit
\q
```

### Using psql (if installed locally)

```bash
psql -h localhost -p 5432 -U spooky_user -d spooky_styles_db
```

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- **Requirement 3.1**: Product catalog with name, price, thumbnail, and availability
- **Requirement 3.2**: Category filtering with indexed queries
- **Requirement 4.1**: Shopping cart with customization storage
- **Requirement 5.3**: Order history with reverse chronological sorting
- **Requirement 7.1**: Product inventory management with stock tracking
- **Requirement 9.2**: Costume inspiration gallery with product associations

## Next Steps

After setting up the database:

1. Implement authentication endpoints (Task 3)
2. Build product catalog API (Task 4)
3. Create shopping cart system (Task 5)
4. Integrate payment processing (Task 6)
