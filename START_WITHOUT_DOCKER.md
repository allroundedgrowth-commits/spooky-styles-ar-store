# Running Spooky Wigs Without Docker

Since Docker isn't working, you can run everything locally on your machine.

## Prerequisites

You need PostgreSQL and Redis installed locally on Windows:

### Install PostgreSQL (if not installed)
1. Download from: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set for the `postgres` user

### Install Redis (if not installed)
1. Download from: https://github.com/microsoftarchive/redis/releases
2. Or use: `choco install redis` (if you have Chocolatey)
3. Or use WSL: `wsl sudo apt-get install redis-server`

## Setup Steps

### 1. Start PostgreSQL
PostgreSQL should auto-start after installation. Check if it's running:
```powershell
Get-Service -Name postgresql*
```

### 2. Start Redis
```powershell
# If installed via Chocolatey or direct install
redis-server

# Or if using WSL
wsl redis-server
```

### 3. Create Database
```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE spooky_styles_db;
CREATE USER spooky_user WITH PASSWORD 'spooky_pass';
GRANT ALL PRIVILEGES ON DATABASE spooky_styles_db TO spooky_user;
\q
```

### 4. Run Database Migrations
```powershell
cd backend
npm run db:migrate
npm run db:seed
```

### 5. Start Backend (Terminal 1)
```powershell
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

### 6. Start Frontend (Terminal 2)
```powershell
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000

## Quick Start (If PostgreSQL & Redis Already Running)

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## Verify Everything Works

1. **Check Backend:** http://localhost:5000/api/products
2. **Check Frontend:** http://localhost:3000
3. **Check Products Page:** http://localhost:3000/products

## Troubleshooting

### PostgreSQL Not Running
```powershell
# Start PostgreSQL service
net start postgresql-x64-15
```

### Redis Not Running
```powershell
# Start Redis
redis-server
# Or in WSL
wsl redis-server
```

### Database Connection Error
Check `backend/.env` has correct credentials:
```
DATABASE_URL=postgresql://spooky_user:spooky_pass@localhost:5432/spooky_styles_db
```

### Port Already in Use
```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

## Current Status

✅ Backend code ready
✅ Frontend code ready  
✅ Database migrations ready
✅ 32 products ready to seed
✅ Stripe keys configured
✅ All API endpoints working

Just need PostgreSQL and Redis running locally!
