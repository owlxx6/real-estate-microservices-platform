# 🏠 Module Location - Prochaines Étapes et Fichiers Restants

## ✅ CE QUI EST TERMINÉ

### Backend (100% complété)
- ✅ Structure du rental-service
- ✅ Entités (RentalProperty, Booking)
- ✅ Repositories avec requêtes personnalisées
- ✅ Services avec logique métier complète
- ✅ Controllers REST
- ✅ Client Feign pour property-service
- ✅ Exceptions personnalisées
- ✅ Configuration (application.properties, config-repo)
- ✅ Script SQL d'initialisation
- ✅ Routes ajoutées à l'API Gateway

### Frontend (40% complété)
- ✅ Service API (rentalAPI.js)
- ✅ Page de recherche de locations (RentalSearch.js)

## 📋 FICHIERS RESTANTS À CRÉER

### 1. Frontend - Pages Principales

#### 1.1 RentalDetails.js (Page détails + réservation)
**Chemin**: `frontend/src/pages/RentalDetails.js`

**Fonctionnalités**:
- Afficher les détails complets du bien
- Calcul automatique du prix total
- Formulaire de réservation
- Calendrier de disponibilité
- Règles de la maison

**Structure**:
```javascript
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { rentalAPI, bookingAPI } from '../services/rentalAPI';
// ... Material-UI components

function RentalDetails() {
  // États
  const { id } = useParams();
  const location = useLocation();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    startDate: location.state?.startDate || '',
    endDate: location.state?.endDate || '',
    numberOfGuests: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: ''
  });
  
  // Calcul du prix total
  const calculateTotal = () => {
    if (!rental || !bookingForm.startDate || !bookingForm.endDate) return 0;
    const nights = daysBetween(bookingForm.startDate, bookingForm.endDate);
    return (nights * rental.pricePerNight) + (rental.cleaningFee || 0);
  };
  
  // Soumettre la réservation
  const handleBooking = async () => {
    try {
      await bookingAPI.createBooking(bookingForm);
      // Afficher succès et rediriger
    } catch (err) {
      // Afficher erreur
    }
  };
  
  // Render: Détails + Formulaire + Calendrier
}
```

#### 1.2 MyBookings.js (Mes réservations)
**Chemin**: `frontend/src/pages/MyBookings.js`

**Fonctionnalités**:
- Liste des réservations de l'utilisateur
- Filtres par statut
- Annulation de réservation
- Détails de chaque réservation

#### 1.3 AdminRentals.js (Gestion admin des locations)
**Chemin**: `frontend/src/pages/AdminRentals.js`

**Fonctionnalités**:
- Liste de toutes les propriétés
- Activation/désactivation pour la location
- Formulaire de configuration (prix, règles, capacité)
- Statistiques

**Structure**:
```javascript
import React, { useState, useEffect } from 'react';
import { propertyAPI } from '../services/api';
import { rentalAPI } from '../services/rentalAPI';

function AdminRentals() {
  const [properties, setProperties] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [rentalForm, setRentalForm] = useState({
    propertyId: null,
    pricePerNight: '',
    cleaningFee: 0,
    maxGuests: 1,
    rules: '',
    checkInTime: '15:00',
    checkOutTime: '11:00',
    isActive: true
  });
  
  // Charger les propriétés et les locations
  // Activer une propriété pour la location
  // Désactiver une location
  // Modifier les paramètres
  
  // Render: Table des propriétés + Dialog de configuration
}
```

#### 1.4 AdminBookings.js (Gestion admin des réservations)
**Chemin**: `frontend/src/pages/AdminBookings.js`

**Fonctionnalités**:
- Liste de toutes les réservations
- Filtres par statut, date, bien
- Actions: Confirmer, Annuler, Compléter
- Vue calendrier globale

### 2. Frontend - Composants

#### 2.1 Calendar.js (Calendrier de disponibilité)
**Chemin**: `frontend/src/components/rental/Calendar.js`

**Fonctionnalités**:
- Afficher le mois en cours
- Marquer les dates réservées
- Navigation mois précédent/suivant
- Infobulles avec détails de réservation

#### 2.2 BookingForm.js (Formulaire de réservation)
**Chemin**: `frontend/src/components/rental/BookingForm.js`

#### 2.3 PriceBreakdown.js (Détail des prix)
**Chemin**: `frontend/src/components/rental/PriceBreakdown.js`

### 3. Frontend - Navigation

#### 3.1 Mise à jour de Navbar.js
**Ajouter**:
```javascript
<Button color="inherit" onClick={() => navigate('/rentals')}>
  Rentals
</Button>
<Button color="inherit" onClick={() => navigate('/my-bookings')}>
  My Bookings
</Button>
// Pour admin:
<Button color="inherit" onClick={() => navigate('/admin/rentals')}>
  Manage Rentals
</Button>
<Button color="inherit" onClick={() => navigate('/admin/bookings')}>
  Manage Bookings
</Button>
```

#### 3.2 Mise à jour de App.js
**Ajouter les routes**:
```javascript
import RentalSearch from './pages/RentalSearch';
import RentalDetails from './pages/RentalDetails';
import MyBookings from './pages/MyBookings';
import AdminRentals from './pages/AdminRentals';
import AdminBookings from './pages/AdminBookings';

// Dans <Routes>:
<Route path="/rentals" element={<PrivateRoute><RentalSearch /></PrivateRoute>} />
<Route path="/rentals/:id" element={<PrivateRoute><RentalDetails /></PrivateRoute>} />
<Route path="/my-bookings" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
<Route path="/admin/rentals" element={<PrivateRoute><AdminRentals /></PrivateRoute>} />
<Route path="/admin/bookings" element={<PrivateRoute><AdminBookings /></PrivateRoute>} />
```

## 🚀 COMMANDES POUR LANCER LE RENTAL-SERVICE

### 1. Créer la base de données
```bash
mysql -u root -p < sql/init-rental-db.sql
```

### 2. Compiler le service
```bash
cd rental-service
mvn clean install -DskipTests
```

### 3. Lancer le service
```bash
mvn spring-boot:run
```

Ou ajouter au script `start-all-services.sh`:
```bash
# Rental Service
echo "Starting Rental Service..."
cd rental-service
mvn spring-boot:run > ../logs/rental-service.log 2>&1 &
echo $! > ../logs/rental-service.pid
cd ..
sleep 5
```

## 📊 ORDRE DE LANCEMENT DES SERVICES

1. Eureka Server (8761)
2. Config Server (8888)
3. Property Service (8081)
4. Client Service (8082)
5. Interface Service (8083)
6. **Rental Service (8084)** ← NOUVEAU
7. API Gateway (8080)
8. Frontend (3000)

## 🧪 TESTS À EFFECTUER

### 1. Tests Backend (via Postman ou cURL)

#### Créer un bien en location
```bash
POST http://localhost:8080/api/rentals
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "propertyId": 1,
  "pricePerNight": 150.00,
  "cleaningFee": 50.00,
  "maxGuests": 4,
  "rules": "No smoking\nNo pets\nQuiet hours: 22:00-08:00",
  "checkInTime": "15:00",
  "checkOutTime": "11:00",
  "isActive": true
}
```

#### Rechercher des locations disponibles
```bash
GET http://localhost:8080/api/rentals/search?startDate=2025-01-15&endDate=2025-01-20&guests=2
Authorization: Bearer YOUR_TOKEN
```

#### Créer une réservation
```bash
POST http://localhost:8080/api/bookings
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "rentalPropertyId": 1,
  "startDate": "2025-01-15",
  "endDate": "2025-01-20",
  "numberOfGuests": 2,
  "guestName": "John Doe",
  "guestEmail": "john@example.com",
  "guestPhone": "+1234567890",
  "specialRequests": "Late check-in"
}
```

### 2. Tests Frontend

1. **Page de recherche**
   - Rechercher sans filtres
   - Rechercher avec dates
   - Rechercher avec nombre d'invités
   - Rechercher avec plage de prix

2. **Page de détails**
   - Voir les détails d'un bien
   - Calculer le prix total
   - Soumettre une réservation
   - Voir le calendrier

3. **Gestion admin**
   - Activer une propriété pour la location
   - Modifier les paramètres
   - Désactiver une location
   - Gérer les réservations

## 📝 NOTES IMPORTANTES

### Validation des réservations
Le système valide automatiquement:
- ✅ Dates valides (pas dans le passé)
- ✅ start_date < end_date
- ✅ Capacité respectée (guests <= maxGuests)
- ✅ Pas de chevauchement avec réservations confirmées
- ✅ Bien actif

### Calcul automatique du prix
```
Total = (Nombre de nuits × Prix par nuit) + Frais de ménage
```

### Statuts de réservation
- **PENDING**: En attente de confirmation
- **CONFIRMED**: Confirmée (bloque les dates)
- **CANCELLED**: Annulée
- **COMPLETED**: Terminée

### Communication entre services
Le rental-service communique avec property-service via Feign pour:
- Vérifier l'existence d'une propriété
- Récupérer les détails de la propriété
- Enrichir les DTOs avec les informations complètes

## 🎯 PROCHAINES ÉVOLUTIONS POSSIBLES

1. **Paiement en ligne** (Stripe, PayPal)
2. **Avis et notes** des locataires
3. **Photos multiples** pour chaque bien
4. **Messagerie** entre hôte et locataire
5. **Notifications** par email
6. **Export PDF** des réservations
7. **Tableau de bord** avec graphiques
8. **Règles de tarification dynamique** (saison haute/basse)
9. **Multi-devises**
10. **Multi-langues**

## 📚 DOCUMENTATION API

Une fois le service démarré, la documentation Swagger est disponible à:
```
http://localhost:8084/swagger-ui.html
```

## ✅ CHECKLIST FINALE

Avant de considérer le module terminé:

- [ ] Backend compilé et testé
- [ ] Base de données créée avec le script SQL
- [ ] Service enregistré sur Eureka
- [ ] Routes configurées dans le Gateway
- [ ] Tous les endpoints testés via Postman
- [ ] Frontend compilé sans erreurs
- [ ] Page de recherche fonctionnelle
- [ ] Page de détails fonctionnelle
- [ ] Réservation fonctionnelle
- [ ] Admin peut activer des biens
- [ ] Admin peut gérer les réservations
- [ ] Calendrier affiche correctement les disponibilités
- [ ] Validation des dates fonctionne
- [ ] Calcul des prix correct
- [ ] Messages d'erreur clairs
- [ ] Tests end-to-end réussis

---

**Le module de location courte durée est prêt à être finalisé!** 🎉

Tous les fichiers backend sont créés et configurés. Il reste à créer les pages frontend détaillées pour avoir un système complet et fonctionnel.

