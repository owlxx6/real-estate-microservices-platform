# 🏗️ Plan de Refactoring - Séparation VENTE vs LOCATION

## 📋 ANALYSE DE L'EXISTANT

### Problème Actuel
L'entité `Property` mélange:
- ❌ `transactionType` (SALE/RENTAL) - confus
- ❌ `price` - peut être prix de vente OU loyer
- ❌ `monthlyRent`, `depositAmount`, `rentalDuration` - location longue durée
- ❌ `status` - AVAILABLE, SOLD, RENTED, etc. - statuts mixtes

**Résultat:** Logique métier peu claire et difficile à maintenir

---

## 🎯 NOUVELLE ARCHITECTURE

### Structure proposée:

```
┌─────────────────────────────────────────────────────┐
│                    PROPERTY                         │
│            (Bien Immobilier de Base)                │
│                                                     │
│  • ID, titre, description                          │
│  • Adresse, ville, code postal                     │
│  • Type (APARTMENT, HOUSE, etc.)                   │
│  • Surface, chambres, salles de bain               │
│  • Caractéristiques (parking, jardin, etc.)        │
│  • Agent ID                                         │
│  • Dates création/modification                     │
│                                                     │
└─────────────────────────────────────────────────────┘
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ↓                           ↓
┌───────────────────┐       ┌───────────────────┐
│   SALE_PROPERTY   │       │  RENTAL_PROPERTY  │
│   (Module Vente)  │       │  (Module Location)│
│                   │       │                   │
│ • propertyId      │       │ • propertyId      │
│ • salePrice       │       │ • pricePerNight   │
│ • saleStatus      │       │ • cleaningFee     │
│   - FOR_SALE      │       │ • maxGuests       │
│   - RESERVED      │       │ • rules           │
│   - SOLD          │       │ • checkIn/Out     │
│ • soldAt          │       │ • isActive        │
│ • soldPrice       │       │                   │
└───────────────────┘       └───────────────────┘
                                      │
                                      ↓
                            ┌───────────────────┐
                            │     BOOKINGS      │
                            │  (Réservations)   │
                            │                   │
                            │ • rentalPropertyId│
                            │ • startDate       │
                            │ • endDate         │
                            │ • status          │
                            │ • guestInfo       │
                            └───────────────────┘
```

---

## 🔄 REFACTORING BACKEND

### 1. Property (Entité de Base Simplifiée)

**Conserver uniquement:**
- Informations de base (id, title, description)
- Localisation (address, city, postalCode)
- Type (APARTMENT, HOUSE, etc.)
- Caractéristiques physiques (surface, rooms, bathrooms)
- Features (parking, garden, pool, elevator, floor, year)
- Agent ID
- Métadonnées (createdAt, updatedAt)

**Supprimer:**
- ❌ `transactionType` (plus nécessaire)
- ❌ `price` (sera dans SaleProperty)
- ❌ `monthlyRent` (sera dans RentalProperty ou séparé)
- ❌ `depositAmount` (sera dans RentalProperty)
- ❌ `rentalDuration` (sera dans RentalProperty)
- ❌ `status` (sera dans SaleProperty et RentalProperty séparément)

**Nouveau status:**
- Pas de status global
- Chaque module gère son propre statut

---

### 2. SaleProperty (Nouvelle Entité - Module Vente)

**Création dans:** `property-service`

```java
@Entity
@Table(name = "sale_properties")
public class SaleProperty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "property_id", nullable = false, unique = true)
    private Long propertyId;  // Référence vers Property
    
    @Column(name = "sale_price", nullable = false)
    private BigDecimal salePrice;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "sale_status", nullable = false)
    private SaleStatus saleStatus;  // FOR_SALE, RESERVED, SOLD
    
    @Column(name = "sold_at")
    private LocalDateTime soldAt;
    
    @Column(name = "sold_price")  // Prix réel de vente (peut différer du prix demandé)
    private BigDecimal soldPrice;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum SaleStatus {
        FOR_SALE,    // À vendre
        RESERVED,    // Réservé (offre acceptée, en cours de transaction)
        SOLD         // Vendu
    }
}
```

---

### 3. RentalProperty (Déjà Créé - Module Location)

**Existe dans:** `rental-service`

Déjà complet avec:
- propertyId (lien vers Property)
- pricePerNight (location courte durée type Airbnb)
- cleaningFee
- maxGuests
- rules
- checkInTime, checkOutTime
- isActive

---

## 📊 NOUVELLE STRUCTURE DES TABLES

### Table: properties (Modifiée)
```sql
CREATE TABLE properties (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    surface INT NOT NULL,
    rooms INT NOT NULL,
    bathrooms INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    agent_id BIGINT NOT NULL,
    has_parking BOOLEAN,
    has_garden BOOLEAN,
    has_pool BOOLEAN,
    has_elevator BOOLEAN,
    floor_number INT,
    total_floors INT,
    year_built INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    INDEX idx_city (city),
    INDEX idx_type (type),
    INDEX idx_agent_id (agent_id)
);
```

### Table: sale_properties (Nouvelle)
```sql
CREATE TABLE sale_properties (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL UNIQUE,
    sale_price DECIMAL(15,2) NOT NULL,
    sale_status VARCHAR(20) NOT NULL,
    sold_at TIMESTAMP NULL,
    sold_price DECIMAL(15,2) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    FOREIGN KEY (property_id) REFERENCES properties(id),
    INDEX idx_sale_status (sale_status),
    INDEX idx_is_active (is_active)
);
```

### Table: rental_properties (Existe déjà)
```sql
-- Déjà créée dans rental_db
-- Reste inchangée
```

---

## 🔌 NOUVEAUX ENDPOINTS

### Module Vente (property-service)

```
BASE: /api/sales

GET    /api/sales                     - Liste des biens à vendre
GET    /api/sales/{id}                - Détails d'un bien à vendre
GET    /api/sales/property/{propertyId} - Vente d'une propriété
POST   /api/sales                     - Activer un bien pour la vente
PUT    /api/sales/{id}                - Modifier prix/statut de vente
PUT    /api/sales/{id}/reserve        - Marquer comme réservé
PUT    /api/sales/{id}/sell           - Marquer comme vendu
DELETE /api/sales/{id}                - Désactiver la vente
GET    /api/sales/statistics          - Statistiques de vente
GET    /api/sales/search              - Recherche avec filtres
       ?city=Paris
       &minPrice=100000
       &maxPrice=500000
       &type=APARTMENT
```

### Module Location (rental-service) - Déjà Créé
```
BASE: /api/rentals      [Existe déjà]
BASE: /api/bookings     [Existe déjà]
```

### Properties Base (property-service)
```
BASE: /api/properties   [Simplifié]

GET    /api/properties              - Liste tous les biens (base)
GET    /api/properties/{id}         - Détails d'un bien
POST   /api/properties              - Créer un bien (sans vente/location)
PUT    /api/properties/{id}         - Modifier caractéristiques
DELETE /api/properties/{id}         - Supprimer un bien
GET    /api/properties/agent/{id}   - Biens d'un agent
```

---

## 🎨 REFACTORING FRONTEND

### Nouvelle Structure de Navigation

```
Navbar:
├── Property Search (Liste de TOUS les biens)
├── 📦 VENTE (Section)
│   ├── Properties for Sale
│   ├── My Sale Inquiries
│   └── Admin - Manage Sales
└── 🏠 LOCATION (Section)
    ├── Rentals (déjà créé)
    ├── My Bookings (déjà créé)
    ├── Admin - Manage Rentals (déjà créé)
    └── Admin - Manage Bookings (déjà créé)
```

### Pages à Créer

**Module Vente:**
1. `PropertiesForSale.js` - Liste des biens à vendre
2. `SalePropertyDetails.js` - Détails + Demande d'info
3. `AdminSales.js` - Gestion admin des ventes

**Modifications:**
4. `PropertySearch.js` - Afficher tous les biens (base)
5. `PropertyDetails.js` - Afficher si à vendre ET/OU en location

---

## 🔄 PLAN D'IMPLÉMENTATION

### Phase 1: Backend Refactoring ⚙️

**Étape 1.1:** Créer SaleProperty
- Entity, Repository, Service, Controller
- DTOs: SalePropertyDTO, SaleRequestDTO

**Étape 1.2:** Simplifier Property
- Supprimer champs liés vente/location
- Garder uniquement caractéristiques du bien
- Créer script de migration SQL

**Étape 1.3:** Adapter PropertyService
- Simplifier la logique de recherche
- Enlever les filtres transactionType, status
- Garder uniquement filtres physiques (city, type, rooms, price)

**Étape 1.4:** Tester backend
- Vérifier tous les endpoints
- S'assurer que rental-service fonctionne toujours

---

### Phase 2: Frontend Refactoring 🎨

**Étape 2.1:** Créer module Vente
- Service API: saleAPI.js
- Page: PropertiesForSale.js
- Page: SalePropertyDetails.js
- Page: AdminSales.js

**Étape 2.2:** Adapter module Location (déjà fait)
- Aucun changement nécessaire
- Déjà séparé et fonctionnel

**Étape 2.3:** Refactoriser PropertySearch
- Afficher TOUS les biens (base)
- Indiquer si "For Sale" et/ou "For Rent"
- Liens vers détails vente OU location

**Étape 2.4:** Mettre à jour Navigation
- Regrouper par module
- Menu déroulant ou sections

---

## 📝 EXEMPLE D'UTILISATION FINALE

### Scénario 1: Bien uniquement à VENDRE
```
Property #10 → SaleProperty (salePrice: $500,000, status: FOR_SALE)
               ❌ Pas de RentalProperty
               
Visible dans: "Properties for Sale"
```

### Scénario 2: Bien uniquement en LOCATION
```
Property #20 → ❌ Pas de SaleProperty
               ✅ RentalProperty (pricePerNight: $150)
               
Visible dans: "Rentals"
```

### Scénario 3: Bien à VENDRE ET en LOCATION
```
Property #30 → ✅ SaleProperty (salePrice: $400,000)
               ✅ RentalProperty (pricePerNight: $200)
               
Visible dans: "Properties for Sale" ET "Rentals"
```

---

## 🔑 POINTS CLÉS

### Avantages de cette Architecture

1. **Séparation claire:** Chaque module a sa propre logique
2. **Flexibilité:** Un bien peut être vente, location, ou les deux
3. **Scalabilité:** Facile d'ajouter d'autres types (location longue durée, etc.)
4. **Maintenabilité:** Code plus lisible et testable
5. **Performance:** Index optimisés par use case

### Design Patterns Appliqués

- **Single Responsibility:** Chaque entité a un rôle unique
- **Composition over Inheritance:** Property + SaleProperty + RentalProperty
- **Microservices:** Séparation en services distincts possible

---

## ⚠️ MIGRATION DES DONNÉES

### Script de Migration Nécessaire

```sql
-- 1. Créer la table sale_properties
CREATE TABLE sale_properties (...);

-- 2. Migrer les données existantes
INSERT INTO sale_properties (property_id, sale_price, sale_status, is_active)
SELECT id, price, status, TRUE
FROM properties
WHERE transaction_type = 'SALE';

-- 3. Supprimer les colonnes obsolètes de properties
ALTER TABLE properties 
    DROP COLUMN transaction_type,
    DROP COLUMN price,
    DROP COLUMN monthly_rent,
    DROP COLUMN deposit_amount,
    DROP COLUMN rental_duration,
    DROP COLUMN status;
```

---

## 📊 TEMPS ESTIMÉ

- **Phase 1 - Backend:** 2-3 heures
- **Phase 2 - Frontend:** 2-3 heures
- **Migration & Tests:** 1 heure
- **Total:** 5-7 heures

---

## 🎯 PROCHAINE ÉTAPE

**Validation de l'architecture proposée**

Cette refactorisation va:
- ✅ Séparer clairement VENTE et LOCATION
- ✅ Rendre le code plus maintenable
- ✅ Permettre plus de flexibilité
- ✅ Améliorer la clarté de l'interface

**Voulez-vous que je commence l'implémentation?**

