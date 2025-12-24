# 🔐 Plan d'Implémentation - Système de Rôles et Droits d'Accès

## 📋 Rôles Définis

### ADMIN
- ✅ Accès total à l'application
- ✅ Gestion complète des biens, ventes, locations, réservations
- ✅ Gestion des utilisateurs (création, modification, suppression)

### AGENT
- ✅ Création, modification et suppression de tous les biens
- ✅ Mise en vente et en location de tous les biens
- ✅ Consultation et annulation de toutes les réservations
- ✅ Accès aux statistiques métier
- ❌ Aucun droit sur la gestion des utilisateurs

### CLIENT
- ✅ Consultation des biens (lecture seule)
- ✅ Création de ses propres réservations
- ✅ Annulation de ses propres réservations uniquement
- ✅ Consultation de son historique
- ❌ Pas d'accès aux fonctions admin/agent

---

## 🏗️ Architecture

### Backend

1. **Entité User** (client-service)
   - id, username, password, email, role (ADMIN, AGENT, CLIENT)
   - Relation avec Agent ou Client si nécessaire

2. **JWT avec Rôle**
   - Inclure le rôle dans le token JWT
   - Extraire le rôle dans les filtres

3. **Spring Security**
   - Configuration avec rôles
   - @PreAuthorize sur les endpoints

4. **Sécurisation des Endpoints**
   - PropertyController: AGENT, ADMIN
   - SalePropertyController: AGENT, ADMIN
   - RentalPropertyController: AGENT, ADMIN
   - BookingController: CLIENT (ses propres), AGENT, ADMIN (toutes)
   - UserController: ADMIN uniquement

### Frontend

1. **Gestion des Rôles**
   - Stocker le rôle dans localStorage
   - Afficher/masquer selon le rôle
   - Redirection selon le rôle

2. **Navigation Conditionnelle**
   - Admin: Tous les liens
   - Agent: Pas de gestion utilisateurs
   - Client: Seulement consultation et réservations

---

## 📝 Étapes d'Implémentation

1. ✅ Créer entité User avec rôles
2. ✅ Modifier JWT pour inclure rôle
3. ✅ Créer UserService et UserRepository
4. ✅ Modifier AuthController pour authentification réelle
5. ✅ Créer annotations de sécurité
6. ✅ Sécuriser PropertyController
7. ✅ Sécuriser SalePropertyController
8. ✅ Sécuriser RentalPropertyController
9. ✅ Sécuriser BookingController (règle CLIENT)
10. ✅ Créer UserController (ADMIN uniquement)
11. ✅ Adapter frontend pour rôles
12. ✅ Créer données de test avec 3 rôles

