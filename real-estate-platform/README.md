# 🏠 Real Estate Platform - Microservices Architecture

**Plateforme complète de gestion immobilière avec architecture microservices**

Support de la **vente** et de la **location** de biens immobiliers.

---

## 🎯 Architecture

### Services d'Infrastructure (Spring Cloud)
- ✅ **Config Server** (8888) - Configuration centralisée avec Git
- ✅ **Eureka Server** (8761) - Service Discovery
- ✅ **API Gateway** (8080) - Point d'entrée unique + JWT Security

### Microservices Métier
- ✅ **Property Service** (8081) - Gestion des biens (vente & location)
- ✅ **Client Service** (8082) - Gestion clients/agents/visites
- ✅ **Interface Service** (8083) - Agrégation de données (Front API)

### Frontend
- ✅ **React Application** (3000) - Interface utilisateur moderne

---

## 🚀 Démarrage Rapide

### 1. Prérequis
```bash
- Java 17+
- Maven 3.8+
- MySQL 8.0 (password: 1234567)
- Node.js 18+ (pour frontend)
```

### 2. Démarrer le Backend
```bash
cd /Users/administrateur/real-estate-platform
./start-all-services.sh
```

### 3. Démarrer le Frontend
```bash
cd frontend
npm start
```

### 4. Accéder à l'Application
- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:8080
- **Eureka Dashboard:** http://localhost:8761

### 5. Se Connecter
- Username: `agent1`
- Password: `password123`

---

## 📊 Fonctionnalités

### Gestion des Biens Immobiliers
- ✅ **Vente de propriétés:**
  - Prix de vente
  - Statuts: AVAILABLE, RESERVED, SOLD
- ✅ **Location de propriétés:**
  - Loyer mensuel
  - Dépôt de garantie
  - Durée de location
  - Statuts: AVAILABLE, RENTED
- ✅ **Types de biens:**
  - Appartements, Maisons, Villas
  - Studios, Duplex, Penthouse
  - Terrains, Commerces, Bureaux
- ✅ **Caractéristiques:**
  - Surface, chambres, salles de bain
  - Parking, jardin, piscine, ascenseur
  - Étage, année de construction

### Gestion des Clients
- ✅ **Types de clients:**
  - BUYER (Acheteur)
  - SELLER (Vendeur)
  - RENTER (Locataire)
  - LANDLORD (Propriétaire bailleur)
  - INVESTOR (Investisseur)

### Gestion des Agents
- ✅ Profil complet
- ✅ Spécialisation
- ✅ Licence professionnelle
- ✅ Années d'expérience
- ✅ Rating

### Gestion des Visites
- ✅ Planification
- ✅ Statuts multiples
- ✅ Notes et feedback
- ✅ Rating des visites

---

## 🔧 Patterns Spring Cloud

### ✅ Service Discovery (Eureka)
- Enregistrement automatique
- Load balancing côté client
- Health checks

### ✅ Configuration Centralisée
- Spring Cloud Config Server
- Dépôt Git (config-repo/)
- Configurations externalisées
- Rechargement dynamique

### ✅ API Gateway
- Routing dynamique
- JWT Authentication
- CORS configuré
- Logging

### ✅ Communication Inter-Services
- **OpenFeign** (Client Service → Property Service)
- **REST APIs** entre microservices
- Service-to-service via Eureka

### ✅ Résilience
- Circuit Breaker (Resilience4j)
- Fallback methods
- Timeout handling

### ✅ Observabilité
- Spring Boot Actuator
- Health endpoints
- Metrics
- Logs centralisés

---

## 📡 APIs Principales

### Authentication
```bash
POST /api/auth/login
{"username":"agent1","password":"password123"}
```

### Properties
```bash
GET  /api/properties              # Toutes les propriétés
GET  /api/properties/for-sale     # À vendre
GET  /api/properties/for-rent     # À louer
GET  /api/properties/search?city=Paris&transactionType=RENTAL
POST /api/properties              # Créer
PUT  /api/properties/{id}         # Modifier
DELETE /api/properties/{id}       # Supprimer
```

### Clients & Agents
```bash
GET  /api/clients                 # Liste clients
GET  /api/agents                  # Liste agents
GET  /api/agents/{id}/properties  # Portfolio (OpenFeign)
```

### Dashboard
```bash
GET  /api/dashboard/statistics    # Stats agrégées
```

---

## 🗄️ Base de Données

### Configuration MySQL
- Host: localhost:3306
- Username: root
- Password: 1234567
- Databases: property_db, client_db

### Données de Test
- 10 propriétés (7 vente, 3 location)
- 5 agents immobiliers
- 5 clients
- 10 visites

---

## 📚 Documentation

### Fichiers Créés
- `BACKEND-COMPLETE.md` - Documentation backend complète
- `FRONTEND-IMPROVEMENTS.md` - Améliorations frontend
- `ETAT-ACTUEL.md` - État du projet
- `README.md` - Ce fichier

### Swagger UI
- Property Service: http://localhost:8081/swagger-ui.html
- Client Service: http://localhost:8082/swagger-ui.html
- Interface Service: http://localhost:8083/swagger-ui.html

### Eureka Dashboard
- http://localhost:8761

---

## 🛠️ Commandes Utiles

### Démarrer/Arrêter
```bash
./start-all-services.sh          # Démarrer backend
./stop-all-services.sh           # Arrêter backend (si existe)
cd frontend && npm start         # Démarrer frontend
```

### Vérifier l'État
```bash
lsof -i :8080 -i :8081 -i :8082 -i :8083 -i :8761 -i :8888 | grep LISTEN
curl http://localhost:8761       # Eureka
./test-connection.sh             # Test complet
```

### Voir les Logs
```bash
tail -f logs/property-service.log
tail -f logs/client-service.log
tail -f logs/api-gateway.log
```

---

## 🎨 Frontend Features

- ✅ **Home Page** - Hero section + features
- ✅ **Property Search** - Filtres avancés + cartes
- ✅ **Property Details** - Vue détaillée + sidebar
- ✅ **Dashboard** - Statistiques + graphiques interactifs
- ✅ **Admin Panel** - CRUD complet
- ✅ **Login** - Authentification JWT
- ✅ **Responsive Design** - Mobile/Tablet/Desktop

---

## 🎓 Points Techniques Démontrés

### Architecture
- ✅ Découpage fonctionnel en microservices
- ✅ Séparation des responsabilités
- ✅ Base de données par microservice
- ✅ Communication inter-services

### Spring Cloud
- ✅ Config Server avec Git
- ✅ Eureka Service Discovery
- ✅ API Gateway avec routing dynamique
- ✅ OpenFeign pour appels inter-services
- ✅ Circuit Breaker (Resilience4j)
- ✅ Actuator pour monitoring

### Sécurité
- ✅ JWT Authentication
- ✅ Token validation
- ✅ CORS configuration
- ✅ Protected endpoints

### DevOps
- ✅ Scripts de démarrage
- ✅ Logs centralisés
- ✅ Health checks
- ✅ Configuration externalisée

---

## 📞 Support

### Tester l'API
```bash
# 1. Obtenir un token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"agent1","password":"password123"}'

# 2. Utiliser le token
curl http://localhost:8080/api/properties \
  -H "Authorization: Bearer <TOKEN>"
```

### Vérifier Eureka
```bash
open http://localhost:8761
```

### Tester le Frontend
```bash
open http://localhost:3000
```

---

## 🎊 Résumé

**Plateforme complète avec:**
- ✅ 6 microservices backend
- ✅ Architecture Spring Cloud complète
- ✅ Support vente ET location
- ✅ Frontend React moderne
- ✅ JWT Security
- ✅ OpenFeign
- ✅ Circuit Breaker
- ✅ Actuator
- ✅ Swagger UI
- ✅ Données de test

**100% Conforme aux exigences du projet! 🚀**

---

## 📖 Pour Aller Plus Loin

### Améliorations Possibles
- Prometheus/Grafana pour monitoring avancé
- Spring Cloud Bus pour refresh config
- Distributed tracing (Zipkin/Sleuth)
- API Rate Limiting
- Redis pour caching
- Kafka pour messaging asynchrone

---

**Développé avec ❤️ pour démontrer une architecture microservices professionnelle**

