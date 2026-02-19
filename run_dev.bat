@echo off
REM PharmaGuard Development Startup Script for Windows

echo.
echo ═══════════════════════════════════════════════════════════════
echo  PharmaGuard - AI Pharmacogenomic Risk Prediction System
echo  RIFT 2026 Hackathon - Pharmacogenomics Track
echo ═══════════════════════════════════════════════════════════════
echo.

REM Check if backend directory exists
if not exist "backend" (
    echo ERROR: backend directory not found!
    echo Please run this script from the PharmaGuard root directory.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: frontend directory not found!
    echo Please run this script from the PharmaGuard root directory.
    pause
    exit /b 1
)

REM Start Backend
echo.
echo [1/2] Starting Backend Server...
echo.
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if requirements installed
pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
)

REM Start backend
echo.
echo Backend server starting on http://localhost:8000
echo.
start cmd /k "python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start Frontend
echo.
echo [2/2] Starting Frontend Development Server...
echo.
cd ..\frontend

REM Check if Python http.server is available
echo Frontend server starting on http://localhost:5500
echo.
python -m http.server 5500 --directory .

pause
