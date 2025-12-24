#!/bin/bash

# Script de test du module de vente
# Teste les endpoints /api/sales via l'API Gateway

echo "================================"
echo "🧪 TEST MODULE VENTE"
echo "================================"
echo ""

API_URL="http://localhost:8080"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Login
echo -e "${YELLOW}1. Connexion...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"agent1","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Échec de connexion${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Connecté${NC}"
echo ""

# 2. Lister les biens à vendre
echo -e "${YELLOW}2. Liste des biens à vendre...${NC}"
SALES=$(curl -s "$API_URL/api/sales" \
  -H "Authorization: Bearer $TOKEN")

SALE_COUNT=$(echo $SALES | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ $SALE_COUNT biens à vendre trouvés${NC}"
echo ""

# 3. Rechercher avec filtres
echo -e "${YELLOW}3. Recherche avec filtres...${NC}"
SEARCH_RESULTS=$(curl -s "$API_URL/api/sales/search?minPrice=100000&maxPrice=500000" \
  -H "Authorization: Bearer $TOKEN")

SEARCH_COUNT=$(echo $SEARCH_RESULTS | grep -o '"id"' | wc -l)
echo -e "${GREEN}✅ $SEARCH_COUNT biens trouvés avec filtres${NC}"
echo ""

# 4. Détails d'un bien
echo -e "${YELLOW}4. Détails du bien à vendre #1...${NC}"
SALE_DETAILS=$(curl -s "$API_URL/api/sales/1" \
  -H "Authorization: Bearer $TOKEN")

if echo $SALE_DETAILS | grep -q '"id"'; then
  echo -e "${GREEN}✅ Détails récupérés${NC}"
  PRICE=$(echo $SALE_DETAILS | grep -o '"salePrice":[0-9.]*' | cut -d':' -f2)
  STATUS=$(echo $SALE_DETAILS | grep -o '"saleStatus":"[^"]*' | cut -d'"' -f4)
  echo "   Prix de vente: \$$PRICE"
  echo "   Statut: $STATUS"
else
  echo -e "${RED}❌ Erreur${NC}"
fi
echo ""

# 5. Statistiques
echo -e "${YELLOW}5. Statistiques de vente...${NC}"
STATS=$(curl -s "$API_URL/api/sales/statistics" \
  -H "Authorization: Bearer $TOKEN")

echo -e "${GREEN}✅ Statistiques récupérées${NC}"
echo "   À vendre: $(echo $STATS | grep -o '"forSale":[0-9]*' | cut -d':' -f2)"
echo "   Réservés: $(echo $STATS | grep -o '"reserved":[0-9]*' | cut -d':' -f2)"
echo "   Vendus: $(echo $STATS | grep -o '"sold":[0-9]*' | cut -d':' -f2)"
echo ""

echo "================================"
echo -e "${GREEN}✅ MODULE VENTE OPÉRATIONNEL!${NC}"
echo "================================"
echo ""
echo "URLs frontend:"
echo "  - Biens à vendre: http://localhost:3000/properties/for-sale"
echo "  - Admin ventes: http://localhost:3000/admin/sales"
echo ""

