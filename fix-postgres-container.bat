@echo off
echo ========================================
echo Fixing PostgreSQL Container
echo ========================================
echo.

echo Step 1: Stopping all containers...
docker-compose down
echo.

echo Step 2: Removing PostgreSQL volume (this will delete data)...
docker volume rm kiroween_postgres_data
echo.

echo Step 3: Starting containers with fresh database...
docker-compose up -d postgres redis
echo.

echo Step 4: Waiting for PostgreSQL to be ready (30 seconds)...
timeout /t 30 /nobreak
echo.

echo Step 5: Checking PostgreSQL status...
docker exec spooky-styles-postgres pg_isready -U spooky_user
echo.

echo Step 6: Running database setup...
cd backend
call npm run db:setup
cd ..
echo.

echo ========================================
echo PostgreSQL container fixed!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: npm run dev:backend
echo 2. Start frontend: npm run dev:frontend
echo.
pause
