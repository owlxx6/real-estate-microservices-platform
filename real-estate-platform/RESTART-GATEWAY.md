# Redémarrage du Gateway - Correction JWT

## Problème identifié

Les clés JWT étaient différentes entre :
- **Gateway** : `mySecretKeyForRealEstatePlatform2024VerySecureAndLongEnough`
- **Interface-service** : `realestate-secret-key-for-jwt-token-generation-minimum-256-bits-required-for-hmac-sha-algorithms`

Le token généré par `interface-service` ne pouvait pas être validé par le `Gateway`, causant des erreurs 401.

## Correction appliquée

✅ Clé JWT alignée dans `config-repo/api-gateway.properties` pour correspondre à celle de `interface-service`.

## Redémarrage nécessaire

Le Gateway doit être redémarré pour charger la nouvelle configuration.

### Commandes pour redémarrer :

```bash
# 1. Arrêter le Gateway
kill $(cat logs/api-gateway.pid)

# 2. Attendre quelques secondes
sleep 3

# 3. Redémarrer le Gateway
cd api-gateway
mvn spring-boot:run > ../logs/api-gateway.log 2>&1 &
echo $! > ../logs/api-gateway.pid

# 4. Attendre le démarrage (environ 20-30 secondes)
sleep 30
```

### Test après redémarrage :

```bash
# 1. Obtenir un token ADMIN
TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

# 2. Tester l'endpoint dashboard
curl -X GET "http://localhost:8080/api/dashboard/statistics" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

## Résultat attendu

- ✅ Code HTTP 200
- ✅ Données de statistiques retournées
- ✅ Plus de 401 Unauthorized

## Vérification des logs

Après redémarrage, vérifier les logs :
```bash
tail -f logs/api-gateway.log | grep -i "dashboard\|role\|admin"
```

Vous devriez voir :
- `Request authenticated for user: admin with role: ADMIN`
- Les headers `X-User-Role: ADMIN` transmis vers interface-service

