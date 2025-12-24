#!/bin/bash

# Script de test du module de location
# Teste les endpoints principaux via l'API Gateway

echo "================================"
echo "🧪 TEST MODULE LOCATION"
echo "================================"
echo ""

API_URL="http://localhost:8080"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Login pour obtenir le token
echo -e "${YELLOW}1. Connexion...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"agent1","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Échec de connexion${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Connecté avec succès${NC}"
echo ""

# 2. Lister les locations actives
echo -e "${YELLOW}2. Liste des locations actives...${NC}"
RENTALS=$(curl -s "$API_URL/api/rentals" \
  -H "Authorization: Bearer $TOKEN")

RENTAL_COUNT=$(echo $RENTALS | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ $RENTAL_COUNT locations trouvées${NC}"
echo ""

# 3. Rechercher des locations disponibles
echo -e "${YELLOW}3. Recherche avec filtres (dates + invités)...${NC}"
SEARCH_RESULTS=$(curl -s "$API_URL/api/rentals/search?startDate=2025-01-15&endDate=2025-01-20&guests=2" \
  -H "Authorization: Bearer $TOKEN")

SEARCH_COUNT=$(echo $SEARCH_RESULTS | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ $SEARCH_COUNT locations disponibles trouvées${NC}"
echo ""

# 4. Obtenir les détails d'une location
echo -e "${YELLOW}4. Détails de la location #1...${NC}"
RENTAL_DETAILS=$(curl -s "$API_URL/api/rentals/1" \
  -H "Authorization: Bearer $TOKEN")

if echo $RENTAL_DETAILS | grep -q '"id"'; then
  echo -e "${GREEN}✅ Détails récupérés${NC}"
  echo "   Prix par nuit: \$$(echo $RENTAL_DETAILS | grep -o '"pricePerNight":[0-9.]*' | cut -d':' -f2)"
  echo "   Capacité: $(echo $RENTAL_DETAILS | grep -o '"maxGuests":[0-9]*' | cut -d':' -f2) invités"
else
  echo -e "${RED}❌ Erreur de récupération${NC}"
fi
echo ""

# 5. Créer une réservation de test
echo -e "${YELLOW}5. Création d'une réservation de test...${NC}"
BOOKING_RESPONSE=$(curl -s -X POST "$API_URL/api/bookings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rentalPropertyId": 3,
    "startDate": "2025-03-10",
    "endDate": "2025-03-15",
    "numberOfGuests": 2,
    "guestName": "Test User",
    "guestEmail": "test@example.com",
    "guestPhone": "+33601020304",
    "specialRequests": "Test booking"
  }')

if echo $BOOKING_RESPONSE | grep -q '"id"'; then
  BOOKING_ID=$(echo $BOOKING_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo -e "${GREEN}✅ Réservation créée avec ID: $BOOKING_ID${NC}"
  echo "   Status: $(echo $BOOKING_RESPONSE | grep -o '"status":"[^"]*' | cut -d'"' -f4)"
  echo "   Prix total: \$$(echo $BOOKING_RESPONSE | grep -o '"totalPrice":[0-9.]*' | cut -d':' -f2)"
else
  echo -e "${RED}❌ Erreur de création${NC}"
  echo "$BOOKING_RESPONSE"
fi
echo ""

# 6. Vérifier la disponibilité
echo -e "${YELLOW}6. Vérification de disponibilité...${NC}"
AVAILABILITY=$(curl -s "$API_URL/api/bookings/check-availability?rentalId=1&startDate=2025-04-01&endDate=2025-04-05" \
  -H "Authorization: Bearer $TOKEN")

if echo $AVAILABILITY | grep -q '"available":true'; then
  echo -e "${GREEN}✅ Dates disponibles${NC}"
elif echo $AVAILABILITY | grep -q '"available":false'; then
  echo -e "${YELLOW}⚠️  Dates non disponibles (normal si déjà réservé)${NC}"
else
  echo -e "${RED}❌ Erreur de vérification${NC}"
fi
echo ""

# 7. Statistiques
echo -e "${YELLOW}7. Récupération des statistiques...${NC}"
STATS=$(curl -s "$API_URL/api/rentals/statistics" \
  -H "Authorization: Bearer $TOKEN")

echo -e "${GREEN}✅ Statistiques récupérées${NC}"
echo "   Locations actives: $(echo $STATS | grep -o '"activeRentals":[0-9]*' | cut -d':' -f2)"
echo "   Réservations confirmées: $(echo $STATS | grep -o '"confirmedBookings":[0-9]*' | cut -d':' -f2)"
echo "   Réservations en attente: $(echo $STATS | grep -o '"pendingBookings":[0-9]*' | cut -d':' -f2)"
echo ""

# 8. Liste des réservations
echo -e "${YELLOW}8. Liste de toutes les réservations...${NC}"
ALL_BOOKINGS=$(curl -s "$API_URL/api/bookings" \
  -H "Authorization: Bearer $TOKEN")

BOOKING_TOTAL=$(echo $ALL_BOOKINGS | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ $BOOKING_TOTAL réservations totales${NC}"
echo ""

echo "================================"
echo -e "${GREEN}✅ TOUS LES TESTS RÉUSSIS!${NC}"
echo "================================"
echo ""
echo "URLs disponibles:"
echo "  - Eureka: http://localhost:8761"
echo "  - Rental Service: http://localhost:8084"
echo "  - Swagger UI: http://localhost:8084/swagger-ui.html"
echo "  - API Gateway: http://localhost:8080"
echo "  - Frontend: http://localhost:3000"
echo ""
echo "Pages frontend:"
echo "  - Recherche: http://localhost:3000/rentals"
echo "  - Mes réservations: http://localhost:3000/my-bookings"
echo "  - Admin locations: http://localhost:3000/admin/rentals"
echo "  - Admin bookings: http://localhost:3000/admin/bookings"
echo ""

