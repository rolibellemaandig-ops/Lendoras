#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "======================================"
echo "  🚀 Lendora Full Stack App"
echo "======================================"
echo -e "${NC}"

# Get computer IP
get_ip() {
    if [ "$(uname)" = "Darwin" ]; then
        # macOS
        ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}'
    else
        # Linux
        hostname -I | awk '{print $1}'
    fi
}

COMPUTER_IP=$(get_ip)

echo ""
echo -e "${GREEN}Starting Lendora...${NC}"
echo ""

# Kill previous processes
pkill -f "node.*backend"
pkill -f "node.*frontend"
pkill -f "vite"

sleep 1

# Start backend in background
echo -e "${BLUE}→ Starting Backend...${NC}"
cd backend
npm run dev > /tmp/lendora-backend.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 3

# Start frontend in background
echo -e "${BLUE}→ Starting Frontend...${NC}"
cd frontend
npm run dev > /tmp/lendora-frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

sleep 3

echo ""
echo -e "${GREEN}════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Lendora is Running!${NC}"
echo -e "${GREEN}════════════════════════════════════${NC}"
echo ""

# Check backend
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Backend${NC} - http://localhost:5000"
else
    echo -e "${RED}✗ Backend${NC} - Failed to start (see /tmp/lendora-backend.log)"
fi

# Check frontend
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✓ Frontend${NC} - http://localhost:3000"
else
    echo -e "${RED}✗ Frontend${NC} - Failed to start (see /tmp/lendora-frontend.log)"
fi

echo ""
echo -e "${YELLOW}📱 Phone Access:${NC}"
echo -e "  http://${COMPUTER_IP}:3000"
echo ""
echo "Make sure your phone is on the same WiFi network!"
echo ""
echo -e "${YELLOW}To stop: Press Ctrl+C${NC}"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping Lendora...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" SIGINT

# Keep script alive
while true; do
    sleep 1
    
    # Check if processes are still running
    if ! ps -p $BACKEND_PID > /dev/null; then
        echo -e "${RED}⚠️  Backend process died${NC}"
        tail -20 /tmp/lendora-backend.log
        break
    fi
    
    if ! ps -p $FRONTEND_PID > /dev/null; then
        echo -e "${RED}⚠️  Frontend process died${NC}"
        tail -20 /tmp/lendora-frontend.log
        break
    fi
done
