@echo off
REM Spooky Wigs Store - Quick Start Script for Windows

echo 🎃 Starting Spooky Wigs Store...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker first.
    exit /b 1
)

REM Start Docker containers
echo 1️⃣ Starting Docker containers...
docker-compose up -d

REM Wait for database to be ready
echo 2️⃣ Waiting for database to be ready...
timeout /t 5 /nobreak >nul

REM Clear Redis cache
echo 3️⃣ Clearing Redis cache...
docker exec spooky-styles-redis redis-cli FLUSHALL >nul 2>&1

REM Unlock admin account
echo 4️⃣ Unlocking admin account...
docker exec spooky-styles-postgres psql -U spooky_user -d spooky_styles_db -c "UPDATE users SET failed_login_attempts = 0, account_locked_until = NULL WHERE email = 'admin@spookystyles.com';" >nul 2>&1

echo.
echo ✅ Setup complete!
echo.
echo 📋 Login Credentials:
echo    Admin: admin@spookystyles.com / admin123
echo    User:  test@example.com / password123
echo.
echo 🚀 Now run these commands in separate terminals:
echo    Terminal 1: npm run dev:backend
echo    Terminal 2: npm run dev:frontend
echo.
echo 🌐 Then open: http://localhost:5173
echo.
pause
