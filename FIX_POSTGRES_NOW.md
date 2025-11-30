# Fix PostgreSQL Container - Password Error

## Problem
PostgreSQL container shows: "Database is uninitialized and superuser password is not specified"

## Root Cause
The Docker volume was created without a password and is now persisting that bad state.

## Solution: Reset PostgreSQL Volume

### Option 1: Automated Fix (Recommended)
```bash
fix-postgres-container.bat
```

### Option 2: Manual Fix

**Step 1: Stop all containers**
```bash
docker-compose down
```

**Step 2: Remove the corrupted PostgreSQL volume**
```bash
docker volume ls
docker volume rm kiroween_postgres_data
```

**Step 3: Start containers fresh**
```bash
docker-compose up -d postgres redis
```

**Step 4: Wait 30 seconds for PostgreSQL to initialize**
```bash
# Wait...
```

**Step 5: Verify PostgreSQL is running**
```bash
docker exec spooky-styles-postgres pg_isready -U spooky_user
```

Should output: `postgres:5432 - accepting connections`

**Step 6: Run database setup**
```bash
cd backend
npm run db:setup
```

This will:
- Run all migrations
- Seed products
- Create admin user

**Step 7: Verify products exist**
```bash
docker exec spooky-styles-postgres psql -U spooky_user -d spooky_styles_db -c "SELECT COUNT(*) FROM products;"
```

Should show: `39` products

## Alternative: Use Different Volume Name

If you want to keep the old data, rename the volume in `docker-compose.yml`:

```yaml
volumes:
  postgres_data_v2:  # Changed from postgres_data
  redis_data:
```

Then:
```bash
docker-compose up -d
```

## Verify Everything Works

**1. Check containers are running:**
```bash
docker ps
```

Should see:
- spooky-styles-postgres
- spooky-styles-redis

**2. Check database connection:**
```bash
cd backend
npm run db:test
```

**3. Start backend:**
```bash
npm run dev:backend
```

**4. Test API:**
```bash
curl http://localhost:5000/api/products
```

Should return 39 products.

## Why This Happened

Docker volumes persist data between container restarts. If the volume was created when the container started without proper environment variables, it initialized an empty database with no password. Even after fixing the environment variables, the volume keeps the old (broken) state.

The solution is to delete the volume and let Docker create a fresh one with the correct password.

## Prevention

Always ensure `.env` file exists with proper credentials BEFORE running `docker-compose up` for the first time.
