@echo off
echo ===================================================
echo   Student Management System - One-Click Start
echo ===================================================

:: Ensure we are in the script's directory
cd /d "%~dp0"

echo.
echo [1/3] Stopping any running servers...
taskkill /F /IM node.exe >nul 2>&1
echo Ensuring all processes are dead...
timeout /t 2 >nul
echo Old processes cleared.

echo.
echo [2/3] Starting Backend Server (Port 5001)...
start "Backend Server (Do Not Close)" cmd /k "cd backend && set PORT=5001 && npm start"

echo.
echo [3/3] Starting Frontend Server...
start "Frontend Server (Do Not Close)" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo   All systems go! 
echo   Please wait a moment for the windows to load.
echo ===================================================
pause
