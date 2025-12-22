#!/bin/bash

# Real Estate Platform - Stop All Services Script

echo "================================"
echo "Stopping All Services"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Function to stop a service
stop_service() {
    local service_name=$1
    local pid_file="logs/$service_name.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo -e "Stopping $service_name (PID: $pid)..."
            kill "$pid"
            echo -e "${GREEN}$service_name stopped${NC}"
        else
            echo -e "${RED}$service_name was not running${NC}"
        fi
        rm "$pid_file"
    else
        echo -e "${RED}No PID file found for $service_name${NC}"
    fi
}

stop_service "API Gateway"
stop_service "Interface Service"
stop_service "Client Service"
stop_service "Property Service"
stop_service "Eureka Server"
stop_service "Config Server"

echo ""
echo -e "${GREEN}All services stopped${NC}"

