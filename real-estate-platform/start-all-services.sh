#!/bin/bash

# Real Estate Platform - Complete Startup Script

echo "================================"
echo "Real Estate Platform Startup"
echo "================================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

mkdir -p logs

echo "Step 1: Starting Config Server..."
echo -e "${YELLOW}Starting Config Server...${NC}"
cd /Users/administrateur/real-estate-platform/config-server
mvn spring-boot:run > ../logs/config-server.log 2>&1 &
echo $! > ../logs/config-server.pid
echo -e "${GREEN}Config Server started${NC}"
sleep 15

echo "Step 2: Starting Eureka Server..."
echo -e "${YELLOW}Starting Eureka Server...${NC}"
cd /Users/administrateur/real-estate-platform/eureka-server
mvn spring-boot:run > ../logs/eureka-server.log 2>&1 &
echo $! > ../logs/eureka-server.pid
echo -e "${GREEN}Eureka Server started${NC}"
sleep 15

echo "Step 3: Starting Property Service..."
echo -e "${YELLOW}Starting Property Service...${NC}"
cd /Users/administrateur/real-estate-platform/property-service
mvn spring-boot:run > ../logs/property-service.log 2>&1 &
echo $! > ../logs/property-service.pid
echo -e "${GREEN}Property Service started${NC}"
sleep 20

echo "Step 4: Starting Client Service..."
echo -e "${YELLOW}Starting Client Service...${NC}"
cd /Users/administrateur/real-estate-platform/client-service
mvn spring-boot:run > ../logs/client-service.log 2>&1 &
echo $! > ../logs/client-service.pid
echo -e "${GREEN}Client Service started${NC}"
sleep 20

echo "Step 5: Starting Interface Service..."
echo -e "${YELLOW}Starting Interface Service...${NC}"
cd /Users/administrateur/real-estate-platform/interface-service
mvn spring-boot:run > ../logs/interface-service.log 2>&1 &
echo $! > ../logs/interface-service.pid
echo -e "${GREEN}Interface Service started${NC}"
sleep 15

echo "Step 6: Starting Rental Service..."
echo -e "${YELLOW}Starting Rental Service...${NC}"
cd /Users/administrateur/real-estate-platform/rental-service
mvn spring-boot:run > ../logs/rental-service.log 2>&1 &
echo $! > ../logs/rental-service.pid
echo -e "${GREEN}Rental Service started${NC}"
sleep 15

echo "Step 7: Starting API Gateway..."
echo -e "${YELLOW}Starting API Gateway...${NC}"
cd /Users/administrateur/real-estate-platform/api-gateway
mvn spring-boot:run > ../logs/api-gateway.log 2>&1 &
echo $! > ../logs/api-gateway.pid
echo -e "${GREEN}API Gateway started${NC}"
sleep 15

echo ""
echo "================================"
echo -e "${GREEN}All services started!${NC}"
echo "================================"
echo ""
echo "Service URLs:"
echo "  - Config Server:     http://localhost:8888"
echo "  - Eureka Server:     http://localhost:8761"
echo "  - Property Service:  http://localhost:8081"
echo "  - Client Service:    http://localhost:8082"
echo "  - Interface Service: http://localhost:8083"
echo "  - Rental Service:    http://localhost:8084  [NEW]"
echo "  - API Gateway:       http://localhost:8080"
echo "  - Frontend:          http://localhost:3000"
echo ""
echo "Logs are in logs/ directory"
echo ""

