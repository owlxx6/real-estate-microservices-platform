#!/bin/bash

# Real Estate Platform - Start All Services Script
# This script starts all microservices in the correct order

echo "================================"
echo "Real Estate Platform Startup"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to start a service
start_service() {
    local service_name=$1
    local service_dir=$2
    local wait_time=$3
    
    echo -e "${YELLOW}Starting $service_name...${NC}"
    cd "$service_dir" || exit
    mvn spring-boot:run > "../logs/$service_name.log" 2>&1 &
    echo $! > "../logs/$service_name.pid"
    cd ..
    echo -e "${GREEN}$service_name started (PID: $(cat logs/$service_name.pid))${NC}"
    echo "Waiting $wait_time seconds for $service_name to initialize..."
    sleep "$wait_time"
    echo ""
}

# Create logs directory
mkdir -p logs

echo "Step 1: Starting Config Server..."
start_service "Config Server" "config-server" 15

echo "Step 2: Starting Eureka Server..."
start_service "Eureka Server" "eureka-server" 15

echo "Step 3: Starting Property Service..."
start_service "Property Service" "property-service" 20

echo "Step 4: Starting Client Service..."
start_service "Client Service" "client-service" 20

echo "Step 5: Starting Interface Service..."
start_service "Interface Service" "interface-service" 15

echo "Step 6: Starting API Gateway..."
start_service "API Gateway" "api-gateway" 15

echo ""
echo "================================"
echo -e "${GREEN}All services started successfully!${NC}"
echo "================================"
echo ""
echo "Service URLs:"
echo "  - Config Server:    http://localhost:8888"
echo "  - Eureka Server:    http://localhost:8761"
echo "  - Property Service: http://localhost:8081"
echo "  - Client Service:   http://localhost:8082"
echo "  - Interface Service: http://localhost:8083"
echo "  - API Gateway:      http://localhost:8080"
echo ""
echo "To start the frontend:"
echo "  cd frontend && npm install && npm start"
echo ""
echo "To stop all services, run: ./stop-all-services.sh"
echo ""
echo "Logs are available in the logs/ directory"

