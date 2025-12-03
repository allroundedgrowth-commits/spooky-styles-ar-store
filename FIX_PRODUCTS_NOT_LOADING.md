# Fix: Products Not Loading - 500 Internal Server Error

## Issue Found ✅
Backend API is returning **500 Internal Server Error** when trying to fetch products.

```
GET http://localhost:5000/api/products
Response: {"error":{"message":"Internal server error","statusCode":500}}
```

## Root Cause
The backend is running but encountering an error when querying the database. This is typically caused by:
1. Database not running
2. Database connection error
3. Missing tables/migrations
4. Query error in product service

## Quick Fix Steps

### Step 1: Check if Database is Running
```bash
# Check Docker containers
docker ps

# Should see postgres container running
# If not, start it:
docker-compose up -d
```

### Step 2: Test Database Connection
```bash
# Run database test
npm run db:test --workspace=backend

# Expected output:
# ✅ Database connection successful
```

### Step 3: Check Backend Logs
Look at the terminal where backend is running for error messages like:
```
❌ Error: connect ECONNREFUSED
❌ Error: relation "products" does not exist
❌ Error: column "ar_image_url" does not exist
```

### Step 4: Run Migrations (if needed)
```bash
# Run all migrations
npm run db:migrate --workspace=backend

# Or run setup-all (migrations + seed)
npm run db:setup --workspace=backend
```

### Step 5: Restart Backend
```bash
# Stop backend (Ctrl+C)
# Then restart:
npm run dev:backend
```

### Step 6: Test Again
```bash
curl http://localhost:5000/api/products

# Should return JSON array of products
```

## Common Errors & Solutions

### Error 1: "connect ECONNREFUSED"
**Cause:** Database not running
**Fix:**
```bash
docker-compose up -d
```

### Error 2: "relation 'products' does not exist"
**Cause:** Migrations not run
**Fix:**
```bash
npm run db:migrate --workspace=backend
npm run db:seed --workspace=backend
```

### Error 3: "column 'ar_image_url' does not exist"
**Cause:** Old database schema, missing migration
**Fix:**
```bash
# Run the 2D AR migration
npm run db:run-2d-ar-migration --workspace=backend

# Or run all migrations
npm run db:migrate --workspace=backend
```

### Error 4: "password authentication failed"
**Cause:** Wrong database credentials
**Fix:** Check `.env` file:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/spooky_wigs
```

### Error 5: Empty products array `[]`
**Cause:** Database has no products
**Fix:**
```bash
npm run db:seed --workspace=backend
```

## Complete Reset (if nothing works)

```bash
# 1. Stop everything
docker-compose down

# 2. Remove database volume (WARNING: deletes all data)
docker-compose down -v

# 3. Start fresh
docker-compose up -d

# 4. Wait 10 seconds for database to initialize
timeout /t 10

# 5. Run setup
npm run db:setup --workspace=backend

# 6. Start backend
npm run dev:backend

# 7. Test
curl http://localhost:5000/api/products
```

## Verify Fix

After fixing, you should see:
```bash
curl http://localhost:5000/api/products

# Response (example):
[
  {
    "id": "...",
    "name": "Spooky Purple Wig",
    "price": 29.99,
    "ar_image_url": "...",
    "image_url": "...",
    "thumbnail_url": "...",
    "colors": [...]
  },
  ...
]
```

## Next Steps

Once products API works:
1. ✅ Products page will load
2. ✅ AR try-on will work
3. ✅ Product details will show
4. ✅ Cart will work

## Need More Help?

Check backend terminal for specific error message and share it.
