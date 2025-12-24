# Solution pour l'erreur 401 sur /api/dashboard/statistics

## Problème
L'endpoint `/api/dashboard/statistics` retourne 401 Unauthorized pour ADMIN via le Gateway, alors que :
- Le login ADMIN fonctionne correctement
- Le token JWT est bien transmis
- L'accès direct à `interface-service` (port 8083) fonctionne (200 OK)

## Cause identifiée
Le Gateway utilise une clé JWT différente de celle utilisée par `interface-service` pour générer le token.

## Solution appliquée

### 1. Alignement des clés JWT
- ✅ Clé JWT dans `config-repo/api-gateway.properties` : alignée avec `interface-service.properties`
- ✅ Suppression de la clé JWT locale dans `api-gateway/src/main/resources/application.properties`

### 2. Vérifications effectuées
- ✅ `DashboardController` autorise explicitement ADMIN et AGENT via `RoleChecker`
- ✅ `FeignRequestInterceptor` transmet correctement les headers `X-User-Role`
- ✅ Le Gateway transmet les headers `X-User-Role`, `X-User-Name`, `X-User-Email` à `interface-service`

### 3. Configuration finale

**config-repo/api-gateway.properties:**
```properties
jwt.secret=realestate-secret-key-for-jwt-token-generation-minimum-256-bits-required-for-hmac-sha-algorithms
jwt.expiration=86400000
```

**config-repo/interface-service.properties:**
```properties
jwt.secret=realestate-secret-key-for-jwt-token-generation-minimum-256-bits-required-for-hmac-sha-algorithms
jwt.expiration=86400000
```

## Actions requises

1. **Redémarrer le Gateway** pour charger la configuration depuis Config Server :
   ```bash
   pkill -f "ApiGatewayApplication"
   cd api-gateway
   mvn spring-boot:run > ../logs/api-gateway.log 2>&1 &
   ```

2. **Vérifier que le Config Server est accessible** :
   ```bash
   curl http://localhost:8888/api-gateway/default
   ```

3. **Tester l'accès au dashboard** :
   ```bash
   TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password123"}' \
     | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")
   
   curl -X GET "http://localhost:8080/api/dashboard/statistics" \
     -H "Authorization: Bearer $TOKEN"
   ```

## Résultat attendu
- ✅ Code HTTP 200
- ✅ Statistiques du dashboard retournées
- ✅ Aucun 401 Unauthorized

## Notes
- Le Gateway doit être redémarré après toute modification de configuration
- Les logs du Gateway sont dans `logs/api-gateway.log`
- Si le problème persiste, vérifier que le Config Server est démarré et accessible

