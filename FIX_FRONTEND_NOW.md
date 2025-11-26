# Fix Frontend Connection - Quick Steps

## The Problem
Your frontend is still trying to connect to the wrong backend port.

## The Solution (2 Steps)

### Step 1: Stop Frontend
In your terminal where the frontend is running, press:
```
Ctrl + C
```

### Step 2: Restart Frontend
```bash
npm run dev:frontend
```

## What This Does
- Reloads the `.env` file with `VITE_API_URL=http://localhost:3000/api`
- Connects frontend (port 3001) to backend (port 3000)

## After Restart

### Test Products Loading:
1. Open: http://localhost:3001
2. Products should load automatically

### Test Admin Login:
1. Go to: http://localhost:3001/account
2. Email: `admin@spookystyles.com`
3. Password: `Admin123!`

## Still Not Working?

### Check Browser Console (F12):
1. Press F12 in browser
2. Go to Console tab
3. Look for errors
4. Share the error message

### Check Network Tab:
1. Press F12
2. Go to Network tab
3. Try to login
4. Look for the `/auth/login` request
5. Check if it's going to `http://localhost:3000/api/auth/login`

## Quick Test
Open this in browser to test backend directly:
```
http://localhost:3000/api/products
```

You should see JSON with 44 products.

## Summary
✅ Backend: Running on port 3000 with Supabase  
✅ Frontend: Should run on port 3001  
✅ Admin exists in database  
✅ Products exist in database  
❌ Frontend needs restart to connect properly
