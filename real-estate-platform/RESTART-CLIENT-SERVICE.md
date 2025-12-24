# 🔄 Redémarrer Client-Service

## ⚠️ IMPORTANT

Le `client-service` doit être **redémarré** pour prendre en compte les nouveaux endpoints `/api/users/**`.

## 🚀 Étapes

### Option 1: Redémarrer uniquement client-service

```bash
# 1. Trouver le PID
ps aux | grep client-service | grep -v grep

# 2. Kill le processus (remplacer PID par le numéro trouvé)
kill PID

# 3. Redémarrer
cd client-service
mvn spring-boot:run &
```

### Option 2: Redémarrer tous les services

```bash
./stop-all-services.sh
sleep 5
./start-all-services.sh
```

## ✅ Vérification

Après redémarrage, tester:

```bash
# Tester l'endpoint directement
curl http://localhost:8082/api/users/username/admin

# Tester l'authentification
curl -X POST "http://localhost:8082/api/users/authenticate" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

Si ça retourne 404, le service n'a pas été redémarré correctement.

