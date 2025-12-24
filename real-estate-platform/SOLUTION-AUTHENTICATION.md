# 🔧 Solution Complète - Problème d'Authentification

## 🐛 Problème Identifié

Seul `agent1` fonctionne, `admin` et `client1` retournent "Identifiants incorrects".

## 🔍 Cause Racine

Le `client-service` a été démarré **AVANT** l'ajout du `UserController`. Les endpoints `/api/users/**` ne sont donc pas disponibles, ce qui fait échouer l'authentification pour tous les utilisateurs sauf `agent1` (qui était peut-être géré différemment avant).

## ✅ Solution

### Étape 1: Redémarrer client-service

**Option A - Script automatique:**
```bash
./restart-client-service.sh
```

**Option B - Manuel:**
```bash
# 1. Trouver et arrêter client-service
ps aux | grep ClientServiceApplication | grep -v grep
# Notez le PID et exécutez: kill PID

# 2. Redémarrer
cd client-service
mvn spring-boot:run &
cd ..
```

### Étape 2: Vérifier que les utilisateurs existent

```bash
mysql -u root -p1234567 -e "USE client_db; SELECT username, role FROM users;"
```

Si les utilisateurs n'existent pas:
```bash
mysql -u root -p1234567 < sql/regenerate-user-passwords.sql
```

### Étape 3: Tester l'authentification

```bash
# Tester admin
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Tester client1
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"client1","password":"password123"}'
```

**Résultat attendu:**
```json
{
  "token": "eyJhbGc...",
  "username": "admin",
  "message": "Authentication successful",
  "role": "ADMIN"
}
```

## 🔍 Diagnostic

### Vérifier que client-service répond

```bash
# Test 1: Health check
curl http://localhost:8082/actuator/health

# Test 2: Endpoint users
curl http://localhost:8082/api/users/username/admin

# Test 3: Authentification directe
curl -X POST "http://localhost:8082/api/users/authenticate" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

### Si les endpoints retournent 404

→ Le `client-service` n'a pas été redémarré après l'ajout de `UserController`

### Si l'authentification retourne 401

→ Vérifier:
1. Les utilisateurs existent dans la base
2. Le hash BCrypt est correct
3. Le mot de passe est bien "password123"

## 🎯 Après Redémarrage

Une fois `client-service` redémarré, tous les comptes devraient fonctionner:
- ✅ `admin` / `password123` → ADMIN
- ✅ `agent1` / `password123` → AGENT  
- ✅ `client1` / `password123` → CLIENT

## 📝 Notes

- Le hash BCrypt utilisé est: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
- Ce hash correspond à "password123"
- Tous les utilisateurs de test ont le même mot de passe
- Le `client-service` doit être redémarré après chaque modification du code

