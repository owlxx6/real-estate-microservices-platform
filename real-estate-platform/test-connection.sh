#!/bin/bash

# Quick test script for Real Estate Platform

echo "================================"
echo "Testing Real Estate Platform"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: API Gateway
echo -n "API Gateway (8080)... "
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test 2: Frontend
echo -n "Frontend (3000)... "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test 3: Authentication
echo -n "Authentication... "
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"agent1","password":"password123"}' | \
  python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Test 4: Properties
echo -n "Properties API... "
PROPS=$(curl -s "http://localhost:8080/api/properties" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys, json; print(len(json.load(sys.stdin).get('content', [])))" 2>/dev/null)

if [ "$PROPS" -gt 0 ]; then
    echo -e "${GREEN}✓ ($PROPS properties)${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Test 5: Dashboard
echo -n "Dashboard API... "
TOTAL=$(curl -s "http://localhost:8080/api/dashboard/statistics" \
  -H "Authorization: Bearer $TOKEN" | \
  python3 -c "import sys, json; print(json.load(sys.stdin).get('totalProperties', 0))" 2>/dev/null)

if [ "$TOTAL" -gt 0 ]; then
    echo -e "${GREEN}✓ ($TOTAL total)${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}Platform is running!${NC}"
echo "================================"
echo ""
echo -e "${YELLOW}To see data in frontend:${NC}"
echo "1. Go to: http://localhost:3000/login"
echo "2. Login: agent1 / password123"
echo "3. Navigate to Property Search"
echo ""

