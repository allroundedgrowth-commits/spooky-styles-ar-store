# Products Not Loading - Root Cause & Fix

## 🔍 Root Cause Identified

### Issue 1: Wrong API URL in Frontend
- **Frontend configured**: `http://localhost:5000/api`
- **Backend actually running on**: `http://localhost:3000/api` (Docker container)
- **Result**: Frontend can't reach backend

### Issue 2: Empty Database
- Backend connects to Supabase successfully ✅
- Database has **ZERO products** ❌
- API returns: `{"success":true,"data":[],"count":0}`

### Issue 3: Database Connection Timeout (Local)
- Local `npm run db:test` times out
- This is because it tries to connect to Supabase from outside Docker
- Docker container connects fine

---

## ✅ Fixes Applied

### 1. Fixed Frontend API URL
**File**: `frontend/.env`

**Before**:
```env
VITE_API_URL=http://localhost:5000/api
```

**After**:
```env
VITE_API_URL=http://localhost:3000/api
```

### 2. Need to Seed Products
The database is empty and needs products seeded.

---

## 🚀 How to Fix

### Step 1: Restart Frontend (to pick up new API URL)
```bash
# Stop frontend if running (Ctrl+C)
# Then restart:
npm run dev --workspace=frontend
```

### Step 2: Seed Products to Supabase

**Option A: Use Supabase Dashboard**
1. Go to https://yreqvwoiuykxfxxgdusw.supabase.co
2. Navigate to Table Editor → products
3. Insert products manually

**Option B: Use SQL Editor in Supabase**
```sql
INSERT INTO products (name, description, price, category, theme, thumbnail_url, image_url, ar_image_url, stock_quantity, is_accessory)
VALUES
('Witch''s Midnight Wig', 'Long flowing black wig perfect for witch costumes', 29.99, 'Costume', 'Halloween', 
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800',
 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800', 50, false),

('Vampire Red Wig', 'Deep red wig with gothic styling', 34.99, 'Costume', 'Halloween',
 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800',
 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', 30, false),

('Zombie Green Wig', 'Messy green wig for zombie costumes', 24.99, 'Costume', 'Halloween',
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800', 40, false),

('Professional Bob - Black', 'Sleek professional bob wig in black', 49.99, 'Professional', 'Everyday',
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800',
 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800', 25, false),

('Casual Waves - Brown', 'Natural looking wavy brown wig', 39.99, 'Casual', 'Everyday',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800', 35, false);
```

**Option C: Use the backend seed script (if you have access to Supabase locally)**
```bash
# This won't work from outside Docker, but you can try:
docker exec -it spooky-styles-backend sh
# Then inside container:
node dist/db/seed.js
```

---

## 🧪 Testing

### Test 1: Check Backend API
```bash
curl http://localhost:3000/api/products
```

**Expected (after seeding)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Witch's Midnight Wig",
      "price": 29.99,
      ...
    }
  ],
  "count": 5
}
```

### Test 2: Check Frontend
1. Open http://localhost:3000 (or your frontend port)
2. Navigate to Products page
3. Should see products displayed

### Test 3: Check Database Directly
```bash
# In Supabase SQL Editor:
SELECT COUNT(*) FROM products;
# Should return > 0

SELECT id, name, price FROM products LIMIT 5;
# Should show products
```

---

## 📊 Current Status

| Component | Status | Details |
|-----------|--------|---------|
| Backend Running | ✅ | Port 3000 (Docker) |
| Database Connection | ✅ | Supabase connected |
| Redis Connection | ✅ | Connected |
| Frontend API URL | ✅ | Fixed to port 3000 |
| Products in DB | ❌ | **NEEDS SEEDING** |

---

## 🔧 Quick Fix Summary

1. ✅ **Fixed**: Frontend API URL (port 5000 → 3000)
2. ⏳ **TODO**: Seed products to Supabase database
3. ⏳ **TODO**: Restart frontend to pick up new API URL

---

## 🎯 Next Steps

1. **Seed Products** using one of the options above
2. **Restart Frontend**:
   ```bash
   npm run dev --workspace=frontend
   ```
3. **Test**: Navigate to products page
4. **Verify**: Products should load

---

## 🐛 Troubleshooting

### Products Still Not Loading?

**Check 1: Frontend API URL**
```bash
# In browser console (F12):
console.log(import.meta.env.VITE_API_URL)
# Should show: http://localhost:3000/api
```

**Check 2: Backend Response**
```bash
curl http://localhost:3000/api/products
# Should return products array
```

**Check 3: CORS Issues**
```bash
# Check browser console for CORS errors
# Backend should allow localhost:3000 origin
```

**Check 4: Network Tab**
```
F12 → Network Tab → Filter: XHR
Look for: GET http://localhost:3000/api/products
Status should be: 200 OK
```

---

## 📝 Files Changed

1. `frontend/.env` - Updated VITE_API_URL to port 3000
2. `PRODUCTS_NOT_LOADING_FIX.md` - This documentation

---

## 🎉 Expected Result

After seeding and restarting:
- ✅ Frontend connects to backend on port 3000
- ✅ Backend returns products from Supabase
- ✅ Products display on frontend
- ✅ All features work (cart, checkout, AR, etc.)
