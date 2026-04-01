#!/bin/bash

# 🚀 One-Step Deploy Script for Lendora
# This script helps you deploy to various platforms

set -e

echo "🚀 Lendora Deployment Helper"
echo ""
echo "Choose your deployment platform:"
echo ""
echo "1) Railway (Recommended - Easiest)"
echo "2) Render (Free tier available)"
echo "3) Vercel + Heroku"
echo "4) Docker (Self-hosted)"
echo "5) Local Network (Test with friends on WiFi)"
echo ""

read -p "Enter choice (1-5): " choice

case $choice in
  1)
    echo ""
    echo "📦 Railway Deployment"
    echo ""
    echo "Follow these steps:"
    echo ""
    echo "1. Go to https://railway.app"
    echo "2. Sign up with GitHub"
    echo "3. Create new project → Deploy from GitHub"
    echo "4. Select your lendora repository"
    echo "5. Add PostgreSQL database"
    echo "6. Set variables:"
    echo "   DB_USER=postgres"
    echo "   DB_PASSWORD=your_password"
    echo "   NODE_ENV=production"
    echo "   JWT_SECRET=(random string)"
    echo ""
    echo "7. Deploy backend (set root directory to: backend/)"
    echo "8. Deploy frontend (set root directory to: frontend/)"
    echo ""
    echo "Your app will be at: https://your-project.railway.app"
    ;;
  2)
    echo ""
    echo "🎨 Render Deployment"
    echo ""
    echo "Follow these steps:"
    echo ""
    echo "1. Go to https://render.com"
    echo "2. Sign up with GitHub"
    echo "3. New Web Service"
    echo "4. Connect your GitHub repo"
    echo "5. Settings:"
    echo "   - Root Directory: backend/"
    echo "   - Build Command: npm install"
    echo "   - Start Command: node src/server.js"
    echo ""
    echo "6. Add PostgreSQL database"
    echo "7. Set environment variables (see .env)"
    echo "8. Repeat for frontend with root directory: frontend/"
    echo ""
    ;;
  3)
    echo ""
    echo "🌐 Vercel + Heroku"
    echo ""
    echo "Frontend (Vercel):"
    echo "1. Go to https://vercel.com"
    echo "2. Import your GitHub repo"
    echo "3. Set root directory: frontend/"
    echo "4. Deploy!"
    echo ""
    echo "Backend (Heroku):"
    echo "1. Go to https://heroku.com"
    echo "2. Create new app"
    echo "3. Connect GitHub"
    echo "4. Add PostgreSQL add-on"
    echo "5. Deploy from root directory: backend/"
    echo ""
    ;;
  4)
    echo ""
    echo "🐳 Docker Deployment"
    echo ""
    echo "On your VPS:"
    echo ""
    echo "git clone your-repo"
    echo "cd lendora"
    echo "docker-compose up -d"
    echo ""
    echo "Then access at: http://your-server-ip:3000"
    echo ""
    ;;
  5)
    echo ""
    echo "📱 Local Network Testing"
    echo ""
    echo "1. Run: ./run.sh"
    echo ""
    echo "2. Get your IP:"
    echo "   Mac: ifconfig | grep 'inet ' | grep -v 127"
    echo "   Windows: ipconfig"
    echo ""
    echo "3. Share this URL with friends on same WiFi:"
    echo "   http://YOUR_IP:3000"
    echo ""
    echo "4. They visit in Safari"
    echo "5. Tap Share → Add to Home Screen"
    echo ""
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "Need more help? See DEPLOYMENT_GUIDE.md"
