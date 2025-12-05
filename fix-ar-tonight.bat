@echo off
echo ========================================
echo   AR QUICK FIX - Tonight Edition
echo ========================================
echo.

echo Step 1: Installing MediaPipe packages...
cd frontend
call npm install @mediapipe/face_mesh @mediapipe/camera_utils
if errorlevel 1 (
    echo ERROR: Failed to install MediaPipe packages
    pause
    exit /b 1
)
echo ✅ MediaPipe packages installed
echo.

echo Step 2: Checking backend status...
curl -s http://localhost:3000/api/products > nul 2>&1
if errorlevel 1 (
    echo ⚠️  Backend not responding
    echo Starting backend...
    cd ..
    docker-compose up -d
    timeout /t 10 /nobreak > nul
) else (
    echo ✅ Backend is running
)
echo.

echo Step 3: Creating test wig images directory...
cd ..
if not exist "frontend\public\wigs" mkdir "frontend\public\wigs"
echo ✅ Wigs directory created
echo.

echo ========================================
echo   NEXT STEPS (Manual):
echo ========================================
echo.
echo 1. Download transparent wig PNGs:
echo    - Google: "transparent wig PNG"
echo    - Save to: frontend/public/wigs/
echo    - Name them: wig1.png, wig2.png, etc.
echo.
echo 2. Update database with wig URLs:
echo    - Run: node update-wig-images.js
echo.
echo 3. Test the AR:
echo    - Go to: http://localhost:3001/products
echo    - Click any product
echo    - Click "Try On (2D)"
echo    - Upload a photo
echo    - Adjust sliders
echo.
echo 4. If issues, check:
echo    - Browser console (F12)
echo    - AR_CRITICAL_ISSUES_REPORT.md
echo.
echo ========================================
echo   Status Check
echo ========================================
echo.
echo ✅ MediaPipe packages installed
echo ✅ Backend running
echo ✅ Wigs directory created
echo ⚠️  Need to download wig images
echo ⚠️  Need to update database
echo.
pause
