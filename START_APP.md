# Start Your App - Simple Guide

## ✅ Configuration Fixed

- **Backend**: Port 3000 (Docker)
- **Frontend**: Port 5173 (Vite - fixed port)
- **Database**: Supabase (cloud)

## 🚀 Start Everything

Run this ONE command:

```bash
npm run dev
```

This starts both frontend and backend together.

## 🌐 Access Your App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

## 🔐 Admin Login

1. Go to: http://localhost:5173/account
2. Email: `admin@spookystyles.com`
3. Password: `Admin123!`

## ✅ What's Fixed

- Frontend now uses port 5173 (Vite default)
- No more port conflicts
- Backend stays on port 3000
- Frontend connects to correct backend
- Supabase database connected

## 🧪 Test It Works

Open http://localhost:5173 - you should see:
- ✅ Products loading
- ✅ Can login as admin
- ✅ Can add to cart

## 🛑 If Something Goes Wrong

Kill everything and restart:

```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Restart Docker
docker-compose restart backend

# Start frontend
npm run dev
```

Your app is ready!
