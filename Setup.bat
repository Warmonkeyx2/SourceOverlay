@echo off
REM Source Overlay Studio - Setup and Run Script
REM This script will install dependencies and start both frontend and backend

echo.
echo === Source Overlay Studio Setup ===
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Download Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found

REM Install backend dependencies
echo.
echo Installing backend dependencies...
cd backend
if not exist node_modules (
    call npm install
) else (
    echo Backend dependencies already installed
)
cd ..

REM Install frontend dependencies
echo.
echo Installing frontend dependencies...
cd frontend
if not exist node_modules (
    call npm install
) else (
    echo Frontend dependencies already installed
)
cd ..

echo.
echo === Setup Complete ===
echo.
echo To start the application:
echo.
echo Option 1: With Docker (requires Docker Desktop)
echo   docker-compose up
echo.
echo Option 2: Without Docker (requires PostgreSQL running on localhost:5432)
echo   Terminal 1: cd backend && npm run dev
echo   Terminal 2: cd frontend && npm run dev
echo.
echo Frontend: http://localhost:4500
echo Backend:  http://localhost:4501
echo.
pause
