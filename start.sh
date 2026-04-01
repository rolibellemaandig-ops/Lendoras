#!/bin/bash

echo "🚀 Starting Lendora Full-Stack App..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Starting without Docker...${NC}"
    echo ""
    echo -e "${YELLOW}Prerequisites:${NC}"
    echo "1. PostgreSQL must be running on localhost:5432"
    echo "2. Node.js 18+ must be installed"
    echo ""
    
    # Install dependencies
    echo -e "${GREEN}Installing dependencies...${NC}"
    cd backend && npm install
    cd ../frontend && npm install
    cd ..
    
    # Initialize database
    echo -e "${GREEN}Initializing database...${NC}"
    cd backend && npm run db:init
    cd ..
    
    # Start backend
    echo -e "${GREEN}Starting backend...${NC}"
    cd backend && npm run dev &
    BACKEND_PID=$!
    cd ..
    
    sleep 2
    
    # Start frontend
    echo -e "${GREEN}Starting frontend...${NC}"
    cd frontend && npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    echo ""
    echo -e "${GREEN}✓ Lendora is starting!${NC}"
    echo -e "${YELLOW}Backend: http://localhost:5000${NC}"
    echo -e "${YELLOW}Frontend: http://localhost:3000${NC}"
    echo ""
    echo "To access from your phone:"
    echo -e "${YELLOW}http://YOUR_COMPUTER_IP:3000${NC}"
    echo "(Replace YOUR_COMPUTER_IP with your computer's IP address)"
    echo ""
    echo "Press Ctrl+C to stop"
    
    wait
else
    echo -e "${GREEN}Docker found! Starting with Docker Compose...${NC}"
    docker-compose up
fi
