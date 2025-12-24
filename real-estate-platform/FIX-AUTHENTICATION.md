# 🔧 Correction du Problème d'Authentification

## 🐛 Problème Identifié

Seul `agent1` fonctionne, les autres comptes (`admin`, `client1`, etc.) ne fonctionnent pas.

## ✅ Corrections Appliquées

### 1. Mapping User -> UserDTO
**Problème:** Le controller retournait une entité `User` (avec enum `Role`), mais le Feign client attendait un `UserDTO` (avec String).

**Solution:**
- ✅ Créé `UserDTO` dans `client-service`
- ✅ Modifié `UserController` pour retourner `UserDTO` au lieu de `User`
- ✅ Ajouté méthode `convertToDTO()` pour convertir `User` en `UserDTO`

### 2. Gestion d'Erreurs Améliorée
- ✅ Amélioration de la gestion des exceptions dans `AuthService`
- ✅ Meilleur logging pour diagnostiquer les problèmes

---

## 🚀 Étapes pour Résoudre

### Étape 1: Vérifier que les utilisateurs existent dans la base de données

```bash
# Se connecter à MySQL
mysql -u root -p1234567

# Vérifier les utilisateurs
USE client_db;
SELECT id, username, email, role, is_active FROM users;
```

**Si les utilisateurs n'existent pas**, exécuter:
```bash
mysql -u root -p1234567 < sql/create-users-table.sql
```

### Étape 2: Redémarrer les services

```bash
# Arrêter tous les services
./stop-all-services.sh

# Redémarrer
./start-all-services.sh

# Attendre ~2 minutes que tous les services démarrent
```

### Étape 3: Tester l'authentification

```bash
# Exécuter le script de test
./test-authentication.sh
```

Ou tester manuellement:
```bash
# Test admin
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Test client1
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"client1","password":"password123"}'
```

### Étape 4: Vérifier les logs

Si ça ne fonctionne toujours pas, vérifier les logs:

```bash
# Logs API Gateway
tail -f logs/api-gateway.log | grep -i auth

# Logs Client Service
tail -f logs/client-service.log | grep -i user
```

---

## 🔍 Diagnostic

### Si seul agent1 fonctionne:

1. **Vérifier que les autres utilisateurs existent:**
   ```sql
   SELECT * FROM users WHERE username IN ('admin', 'client1', 'client2');
   ```

2. **Vérifier le hash BCrypt:**
   Le hash utilisé est pour "password123". Si vous avez changé le mot de passe, il faut générer un nouveau hash.

3. **Vérifier que client-service est accessible:**
   ```bash
   curl http://localhost:8082/api/users/username/agent1
   ```

4. **Vérifier les erreurs Feign:**
   Les erreurs Feign peuvent être silencieuses. Vérifier les logs pour voir si client-service répond.

---

## 🎯 Solution Rapide

Si le problème persiste, voici une solution de contournement temporaire:

1. **Vérifier que la table users existe:**
   ```sql
   SHOW TABLES LIKE 'users';
   ```

2. **Créer manuellement les utilisateurs si nécessaire:**
   ```sql
   USE client_db;
   
   INSERT IGNORE INTO users (username, password, email, role, is_active) VALUES
   ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@realestate.com', 'ADMIN', TRUE),
   ('client1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'client1@example.com', 'CLIENT', 1, TRUE);
   ```

3. **Redémarrer client-service:**
   ```bash
   # Trouver le PID
   ps aux | grep client-service | grep -v grep
   
   # Kill et redémarrer
   cd client-service
   mvn spring-boot:run &
   ```

---

## 📝 Notes

- Le hash BCrypt `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy` correspond à "password123"
- Tous les utilisateurs de test ont le même mot de passe: `password123`
- Le mapping User -> UserDTO convertit l'enum `Role` en String pour la compatibilité Feign

---

## ✅ Après les Corrections

Une fois les corrections appliquées et les services redémarrés, tous les comptes devraient fonctionner:
- ✅ `admin` / `password123` → ADMIN
- ✅ `agent1` / `password123` → AGENT
- ✅ `agent2` / `password123` → AGENT
- ✅ `client1` / `password123` → CLIENT
- ✅ `client2` / `password123` → CLIENT
- ✅ `client3` / `password123` → CLIENT

