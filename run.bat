@echo off
setlocal enabledelayedexpansion

echo ======================================
echo   Lendora Full Stack App
echo ======================================
echo.

:: Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Starting Lendora...
echo.

:: Kill previous processes
taskkill /F /IM node.exe >nul 2>&1

timeout /t 2 /nobreak >nul

:: Start backend
echo Starting Backend on port 5000...
start "Lendora Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

:: Start frontend
echo Starting Frontend on port 3000...
start "Lendora Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 3 /nobreak >nul

cls
echo ======================================
echo   Lendora is Running!
echo ======================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo To access from your phone:
echo   1. Open Command Prompt and run: ipconfig
echo   2. Find your IPv4 Address (e.g., 192.168.x.x)
echo   3. Visit: http://YOUR_IP:3000
echo.
echo Make sure your phone is on the same WiFi!
echo.
pause
