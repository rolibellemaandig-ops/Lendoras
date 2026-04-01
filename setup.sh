#!/bin/bash

echo "======================================"
echo "  🚀 Lendora App Setup & Start"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node --version) found"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found in PATH"
    echo "Make sure PostgreSQL is running on localhost:5432"
    echo "Download from: https://www.postgresql.org/download/"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend
echo "→ Backend dependencies..."
cd backend
npm install --silent
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi
cd ..

# Install frontend  
echo "→ Frontend dependencies..."
cd frontend
npm install --silent
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo "✓ Dependencies installed"
echo ""

# Initialize database
echo "🗄️  Setting up database..."
cd backend
node src/db/init.js
if [ $? -ne 0 ]; then
    echo "⚠️  Database setup warning - make sure PostgreSQL is running"
fi
cd ..

echo ""
echo "======================================"
echo "  ✓ Setup Complete!"
echo "======================================"
echo ""
echo "To start the app:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend && npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "For phone access:"
echo "  1. Get your IP: ifconfig | grep 'inet ' | grep -v 127"
echo "  2. Visit: http://YOUR_IP:3000"
echo ""
