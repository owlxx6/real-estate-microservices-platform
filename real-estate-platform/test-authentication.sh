#!/bin/bash

echo "=== Test d'authentification ==="
echo ""

BASE_URL="http://localhost:8080/api/auth/login"

echo "1. Test avec admin..."
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}')

if echo "$RESPONSE" | grep -q "token"; then
  echo "✅ admin: SUCCESS"
  echo "$RESPONSE" | grep -o '"role":"[^"]*' | cut -d'"' -f4
else
  echo "❌ admin: FAILED"
  echo "$RESPONSE"
fi

echo ""
echo "2. Test avec agent1..."
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"username":"agent1","password":"password123"}')

if echo "$RESPONSE" | grep -q "token"; then
  echo "✅ agent1: SUCCESS"
  echo "$RESPONSE" | grep -o '"role":"[^"]*' | cut -d'"' -f4
else
  echo "❌ agent1: FAILED"
  echo "$RESPONSE"
fi

echo ""
echo "3. Test avec client1..."
RESPONSE=$(curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"username":"client1","password":"password123"}')

if echo "$RESPONSE" | grep -q "token"; then
  echo "✅ client1: SUCCESS"
  echo "$RESPONSE" | grep -o '"role":"[^"]*' | cut -d'"' -f4
else
  echo "❌ client1: FAILED"
  echo "$RESPONSE"
fi

echo ""
echo "=== Fin des tests ==="

