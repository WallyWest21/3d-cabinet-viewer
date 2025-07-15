@echo off
echo Starting HTTPS development server for AR testing...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo.
echo 🚀 Starting HTTPS server...
echo.
echo 📱 To test on Android:
echo    1. Find your computer's IP address
echo    2. Open Chrome on Android
echo    3. Go to https://[YOUR_IP]:8443/ar-test.html
echo    4. Accept security warning (click Advanced → Proceed)
echo.

npm start

pause
