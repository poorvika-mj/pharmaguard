#!/bin/bash

# PharmaGuard Development Startup Script for macOS/Linux

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo " PharmaGuard - AI Pharmacogenomic Risk Prediction System"
echo " RIFT 2026 Hackathon - Pharmacogenomics Track"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check directories
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "ERROR: backend or frontend directory not found!"
    echo "Please run this script from the PharmaGuard root directory."
    exit 1
fi

# Start Backend
echo ""
echo "[1/2] Starting Backend Server..."
echo ""

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
python3 -c "import fastapi" 2>/dev/null || pip install -r requirements.txt

# Start backend in background
echo ""
echo "Backend server starting on http://localhost:8000"
echo ""

python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start Frontend
echo ""
echo "[2/2] Starting Frontend Development Server..."
echo ""

cd ../frontend

echo "Frontend server starting on http://localhost:5500"
echo ""
echo "Opening browser... (Press Ctrl+C to stop both servers)"
echo ""

# Start Python HTTP server
python3 -m http.server 5500

# Cleanup on exit
trap "kill $BACKEND_PID; exit" EXIT

# Keep script running
wait
