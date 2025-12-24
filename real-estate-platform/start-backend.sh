#!/bin/bash
echo "Starting backend services..."
mkdir -p logs

cd /Users/administrateur/real-estate-platform

echo "1. Starting Config Server..."
cd config-server && mvn spring-boot:run > ../logs/config-server.log 2>&1 &
sleep 15

echo "2. Starting Eureka Server..."
cd ../eureka-server && mvn spring-boot:run > ../logs/eureka-server.log 2>&1 &
sleep 15

echo "3. Starting Property Service..."
cd ../property-service && mvn spring-boot:run > ../logs/property-service.log 2>&1 &
sleep 20

echo "4. Starting Client Service..."
cd ../client-service && mvn spring-boot:run > ../logs/client-service.log 2>&1 &
sleep 20

echo "5. Starting Interface Service..."
cd ../interface-service && mvn spring-boot:run > ../logs/interface-service.log 2>&1 &
sleep 15

echo "6. Starting API Gateway..."
cd ../api-gateway && mvn spring-boot:run > ../logs/api-gateway.log 2>&1 &
sleep 15

echo "✓ All backend services started!"
echo ""
echo "Services:"
echo "- Config Server:    http://localhost:8888"
echo "- Eureka Server:    http://localhost:8761"
echo "- Property Service: http://localhost:8081"
echo "- Client Service:   http://localhost:8082"
echo "- Interface Service: http://localhost:8083"
echo "- API Gateway:      http://localhost:8080"
