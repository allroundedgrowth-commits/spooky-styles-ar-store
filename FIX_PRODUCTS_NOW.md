# 🚨 Fix Products Not Loading - Quick Guide

## Problem
Products not loading because:
1. ❌ Frontend pointing to wrong port (5000 instead of 3000)
2. ❌ Database is empty (no products)

## Solution (2 Steps)

### Step 1: Seed Products to Supabase

1. **Go to Supabase SQL Editor**:
   - URL: https://yreqvwoiuykxfxxgdusw.supabase.co
   - Navigate to: SQL Editor

2. **Copy and paste** the contents of `seed-products-supabase.sql`

3. **Click "Run"**

4. **Verify**: You should see "15 rows inserted"

### Step 2: Restart Frontend

```bash
# Stop frontend (Ctrl+C if running)
# Then restart:
npm run dev --workspace=frontend
```

## Test It Works

### Test 1: Check API
```bash
curl http://localhost:3000/api/products
```
Should return products array with 15 items.

### Test 2: Check Frontend
1. Open browser: http://localhost:3000 (or your frontend port)
2. Navigate to Products page
3. Should see 15 products displayed

## Files Changed
- ✅ `frontend/.env` - API URL fixed (port 3000)
- ✅ `seed-products-supabase.sql` - SQL to seed products

## Status
- ✅ Backend running (port 3000)
- ✅ Database connected (Supabase)
- ✅ Frontend API URL fixed
- ⏳ **TODO**: Run SQL to seed products
- ⏳ **TODO**: Restart frontend

## That's It!
After running the SQL and restarting frontend, products will load! 🎉
