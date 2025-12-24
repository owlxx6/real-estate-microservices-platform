#!/bin/bash

# Real Estate Platform - Stop All Services Script

echo "================================"
echo "Stopping Real Estate Platform"
echo "================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Stop backend services
echo "Stopping backend services..."
ps aux | grep spring-boot:run | grep -v grep | awk '{print $2}' | xargs kill 2>/dev/null
echo -e "${GREEN}✓ Backend services stopped${NC}"

# Stop frontend
echo "Stopping frontend..."
ps aux | grep "react-scripts\|node.*3000" | grep -v grep | awk '{print $2}' | xargs kill 2>/dev/null
echo -e "${GREEN}✓ Frontend stopped${NC}"

# Clean up PID files
echo "Cleaning up..."
rm -f /Users/administrateur/real-estate-platform/logs/*.pid 2>/dev/null
echo -e "${GREEN}✓ Cleanup complete${NC}"

echo ""
echo "================================"
echo -e "${GREEN}All services stopped!${NC}"
echo "================================"
echo ""
echo "To restart:"
echo "  Backend:  ./start-all-services.sh"
echo "  Frontend: cd frontend && npm start"
echo ""

