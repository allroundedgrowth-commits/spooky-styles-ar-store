@echo off
echo ========================================
echo Fixing Backend - Starting Database
echo ========================================
echo.

echo Step 1: Starting PostgreSQL and Redis...
docker-compose up -d postgres redis

echo.
echo Step 2: Waiting for database to be ready (10 seconds)...
timeout /t 10 /nobreak

echo.
echo Step 3: Checking containers...
docker-compose ps

echo.
echo Step 4: Testing database connection...
npm run db:test --workspace=backend

echo.
echo Step 5: Testing products API...
curl http://localhost:5000/api/products

echo.
echo ========================================
echo Done! Check the output above.
echo ========================================
echo.
echo If you see products JSON, everything is working!
echo If you see errors, run: npm run db:setup --workspace=backend
pause
