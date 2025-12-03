@echo off
echo ========================================
echo Starting Spooky Wigs - Mobile Test Mode
echo ========================================
echo.
echo This will start the frontend with HTTPS enabled
echo for mobile camera testing.
echo.
echo IMPORTANT: You'll need to accept the security
echo warning on your mobile device.
echo.

REM Get local IP address
echo Finding your local IP address...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)

:found
set IP=%IP:~1%
echo.
echo ========================================
echo Your local IP: %IP%
echo ========================================
echo.
echo On your phone, navigate to:
echo https://%IP%:5173
echo.
echo Then accept the security warning and
echo grant camera permissions when prompted.
echo.
echo Press any key to start the server...
pause > nul

cd frontend
set VITE_HTTPS=true
npm run dev
