# 🏠 Module de Location Courte Durée - Architecture Détaillée

## 1. ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Location   │  │  Réservation │  │    Admin     │     │
│  │    Search    │  │   Booking    │  │   Rental     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY (Port 8080)                        │
│                  JWT Authentication                         │
│                  CORS Configuration                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
┌──────────────────┐              ┌──────────────────┐
│ PROPERTY SERVICE │              │ RENTAL SERVICE   │
│   (Port 8081)    │              │   (Port 8084)    │
│                  │              │                  │
│ • Properties     │◄────Feign───►│ • RentalProperty │
│ • CRUD           │              │ • Bookings       │
│ • Search         │              │ • Availability   │
│                  │              │ • Statistics     │
└──────────────────┘              └──────────────────┘
        ↓                                      ↓
┌──────────────────┐              ┌──────────────────┐
│  property_db     │              │   rental_db      │
│  (MySQL)         │              │   (MySQL)        │
└──────────────────┘              └──────────────────┘
        ↑                                      ↑
        └──────────────────┬───────────────────┘
                           ↓
                  ┌─────────────────┐
                  │ EUREKA SERVER   │
                  │  (Port 8761)    │
                  └─────────────────┘
```

## 2. STRUCTURE DU MICROSERVICE RENTAL-SERVICE

```
rental-service/
├── pom.xml
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── realestate/
│       │           └── rental/
│       │               ├── RentalServiceApplication.java
│       │               ├── config/
│       │               │   └── SwaggerConfig.java
│       │               ├── controller/
│       │               │   ├── RentalPropertyController.java
│       │               │   └── BookingController.java
│       │               ├── dto/
│       │               │   ├── RentalPropertyDTO.java
│       │               │   ├── BookingDTO.java
│       │               │   ├── BookingRequestDTO.java
│       │               │   ├── AvailabilityRequestDTO.java
│       │               │   └── CalendarDTO.java
│       │               ├── feign/
│       │               │   └── PropertyServiceClient.java
│       │               ├── model/
│       │               │   ├── RentalProperty.java
│       │               │   └── Booking.java
│       │               ├── repository/
│       │               │   ├── RentalPropertyRepository.java
│       │               │   └── BookingRepository.java
│       │               ├── service/
│       │               │   ├── RentalPropertyService.java
│       │               │   └── BookingService.java
│       │               └── exception/
│       │                   ├── PropertyNotAvailableException.java
│       │                   └── InvalidBookingException.java
│       └── resources/
│           ├── application.properties
│           └── bootstrap.properties
└── target/
```

## 3. MODÈLE DE DONNÉES

### 3.1 RentalProperty (Table: rental_properties)

```sql
CREATE TABLE rental_properties (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,  -- Référence vers Property Service
    price_per_night DECIMAL(10,2) NOT NULL,
    cleaning_fee DECIMAL(10,2) DEFAULT 0,
    max_guests INT NOT NULL,
    rules TEXT,
    check_in_time VARCHAR(5) DEFAULT '15:00',  -- Format HH:MM
    check_out_time VARCHAR(5) DEFAULT '11:00',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_property_id (property_id),
    INDEX idx_is_active (is_active)
);
```

### 3.2 Booking (Table: bookings)

```sql
CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rental_property_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_guests INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,  -- PENDING, CONFIRMED, CANCELLED, COMPLETED
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20),
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rental_property_id) REFERENCES rental_properties(id),
    INDEX idx_rental_property (rental_property_id),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_status (status),
    INDEX idx_guest_email (guest_email)
);
```

## 4. ENDPOINTS REST

### 4.1 RentalPropertyController

```
BASE: /api/rentals

GET    /api/rentals                    - Liste tous les biens louables actifs
GET    /api/rentals/{id}               - Détails d'un bien louable
POST   /api/rentals                    - Créer/activer un bien pour la location
PUT    /api/rentals/{id}               - Modifier les paramètres de location
DELETE /api/rentals/{id}               - Désactiver la location
GET    /api/rentals/property/{propertyId} - Obtenir le bien louable d'une propriété
GET    /api/rentals/search             - Rechercher avec disponibilités
       ?startDate=2025-01-15
       &endDate=2025-01-20
       &guests=2
       &minPrice=50
       &maxPrice=200
GET    /api/rentals/{id}/availability  - Calendrier de disponibilité
       ?year=2025&month=1
GET    /api/rentals/statistics         - Statistiques globales
```

### 4.2 BookingController

```
BASE: /api/bookings

GET    /api/bookings                   - Liste toutes les réservations
GET    /api/bookings/{id}              - Détails d'une réservation
POST   /api/bookings                   - Créer une réservation
PUT    /api/bookings/{id}/confirm      - Confirmer une réservation
PUT    /api/bookings/{id}/cancel       - Annuler une réservation
PUT    /api/bookings/{id}/complete     - Marquer comme terminée
GET    /api/bookings/rental/{rentalId} - Réservations d'un bien
GET    /api/bookings/guest/{email}     - Réservations d'un client
GET    /api/bookings/check-availability - Vérifier disponibilité
       ?rentalId=1
       &startDate=2025-01-15
       &endDate=2025-01-20
```

## 5. LOGIQUE MÉTIER CLÉS

### 5.1 Validation de Réservation

```java
// Règles de validation
1. Le bien doit être actif (is_active = true)
2. start_date < end_date
3. start_date >= aujourd'hui
4. number_of_guests <= max_guests
5. Aucune réservation CONFIRMED qui chevauche les dates
6. La propriété doit exister (vérification via Feign)
```

### 5.2 Calcul du Prix

```java
totalPrice = (numberOfNights * pricePerNight) + cleaningFee

où numberOfNights = DAYS_BETWEEN(end_date, start_date)
```

### 5.3 Gestion des Statuts

```
PENDING → CONFIRMED → COMPLETED
    ↓         ↓
CANCELLED  CANCELLED
```

### 5.4 Détection de Chevauchement de Dates

```sql
SELECT COUNT(*) FROM bookings
WHERE rental_property_id = ?
  AND status = 'CONFIRMED'
  AND (
    (start_date BETWEEN ? AND ?)
    OR (end_date BETWEEN ? AND ?)
    OR (start_date <= ? AND end_date >= ?)
  )
```

## 6. INTÉGRATION AVEC PROPERTY-SERVICE

### 6.1 OpenFeign Client

```java
@FeignClient(name = "property-service")
public interface PropertyServiceClient {
    
    @GetMapping("/api/properties/{id}")
    PropertyDTO getPropertyById(@PathVariable Long id);
    
    @GetMapping("/api/properties/exists/{id}")
    Boolean propertyExists(@PathVariable Long id);
}
```

### 6.2 Workflow de Création

```
1. Admin sélectionne une propriété existante
2. Création d'un RentalProperty lié à property_id
3. Vérification via Feign que la propriété existe
4. Activation de la location
```

## 7. FRONTEND - STRUCTURE REACT

```
frontend/src/
├── pages/
│   ├── RentalSearch.js          - Recherche de locations
│   ├── RentalDetails.js         - Détails + Réservation
│   ├── MyBookings.js            - Mes réservations
│   ├── AdminRentals.js          - Gestion admin des locations
│   └── AdminBookings.js         - Gestion admin des réservations
├── components/
│   ├── rental/
│   │   ├── RentalCard.js        - Carte de bien louable
│   │   ├── DateRangePicker.js   - Sélecteur de dates
│   │   ├── BookingForm.js       - Formulaire de réservation
│   │   ├── CalendarView.js      - Calendrier d'occupation
│   │   └── PriceBreakdown.js    - Détail des prix
│   └── Navbar.js (mise à jour)
└── services/
    └── rentalAPI.js             - Appels API
```

## 8. PAGES FRONTEND DÉTAILLÉES

### 8.1 Page Recherche de Location

**Fonctionnalités:**
- Sélecteur de dates (check-in / check-out)
- Filtre par nombre d'invités
- Filtre par prix
- Grille de cartes de biens disponibles
- Prix par nuit affiché
- Capacité d'accueil

### 8.2 Page Détails + Réservation

**Sections:**
- Photos et description du bien
- Prix, frais de ménage, capacité
- Règles de location
- Horaires check-in/out
- Calendrier de disponibilité
- Formulaire de réservation
- Calcul automatique du prix total

### 8.3 Page Admin - Gestion Locations

**Fonctionnalités:**
- Liste des propriétés existantes
- Bouton "Activer pour la location"
- Formulaire de configuration:
  - Prix par nuit
  - Frais de ménage
  - Capacité maximale
  - Règles de la maison
  - Horaires
- Désactivation/activation
- Statistiques par bien

### 8.4 Page Admin - Gestion Réservations

**Fonctionnalités:**
- Liste de toutes les réservations
- Filtres par statut
- Actions: Confirmer, Annuler, Compléter
- Vue calendrier globale
- Statistiques de réservations

## 9. DÉPENDANCES MAVEN

```xml
<!-- pom.xml du rental-service -->
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- Spring Cloud -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-config</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
    </dependency>
    
    <!-- Utilities -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
    
    <!-- Documentation -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    </dependency>
</dependencies>
```

## 10. CONFIGURATION

### application.properties
```properties
spring.application.name=rental-service
server.port=8084

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/rental_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=1234567
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

# Feign
feign.client.config.default.connectTimeout=5000
feign.client.config.default.readTimeout=5000
```

## 11. PROCHAINES ÉTAPES

1. ✅ **Valider l'architecture**
2. 🔨 **Créer la structure du rental-service**
3. 🔨 **Implémenter les entités et repositories**
4. 🔨 **Développer la logique métier**
5. 🔨 **Créer les controllers et DTOs**
6. 🔨 **Configurer Gateway et Eureka**
7. 🔨 **Développer le frontend**
8. 🧪 **Tester le flux complet**

---

## 📝 NOTES IMPORTANTES

- **Séparation claire**: RentalProperty ≠ Property
- **Validation stricte**: Dates, disponibilité, capacité
- **Communication Feign**: Vérification de l'existence des propriétés
- **Gestion des erreurs**: Exceptions métier claires
- **Performance**: Index sur dates et statuts
- **Évolutivité**: Prêt pour ajout de fonctionnalités (avis, paiements, etc.)

Cette architecture assure une séparation propre entre la gestion immobilière et la location courte durée, tout en permettant une communication efficace entre les services.

