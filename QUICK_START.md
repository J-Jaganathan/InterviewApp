#!/bin/bash
# Quick Start Guide - Run Frontend and Backend Together

echo "======================================"
echo "Interview App - Full Stack Setup"
echo "======================================"

# Terminal 1: Backend
echo ""
echo "📌 TERMINAL 1: Start Backend"
echo "======================================"
echo "Run these commands in PowerShell 1:"
echo ""
echo "cd \"c:\Users\2480328\OneDrive - Cognizant\Desktop\Project\Interview_App\backend\""
echo ".\venv\Scripts\Activate.ps1"
echo "python app.py"
echo ""
echo "✅ Backend will run on: http://127.0.0.1:5000"
echo ""

# Terminal 2: Frontend
echo "📌 TERMINAL 2: Start Frontend"
echo "======================================"
echo "Run these commands in PowerShell 2:"
echo ""
echo "cd \"c:\Users\2480328\OneDrive - Cognizant\Desktop\Project\Interview_App\frontend\""
echo "npm install"
echo "npm run dev"
echo ""
echo "✅ Frontend will run on: http://localhost:3000"
echo ""

# Testing
echo "📌 TESTING"
echo "======================================"
echo ""
echo "1️⃣ Open browser and go to: http://localhost:3000"
echo ""
echo "2️⃣ API Endpoints (use Postman/Thunder Client):"
echo "   - Health Check: GET http://127.0.0.1:5000/api/health"
echo "   - Register: POST http://127.0.0.1:5000/api/auth/register"
echo "   - Login: POST http://127.0.0.1:5000/api/auth/login"
echo "   - Candidates: GET http://127.0.0.1:5000/api/candidates"
echo "   - Questions: GET http://127.0.0.1:5000/api/questions"
echo "   - Interviews: GET http://127.0.0.1:5000/api/interviews"
echo ""

echo "🎯 Happy Testing!"
