# 🔍 Diagnostic - Problème d'Authentification

## 🐛 Symptôme
Quand on entre username/password et clique sur Login, la page se rafraîchit sans rien faire.

## ✅ Corrections Appliquées

### 1. Gestion d'erreur améliorée dans Login.js
- ✅ Vérification que la réponse contient les données
- ✅ Vérification que le token existe
- ✅ Messages d'erreur plus détaillés
- ✅ Logging des erreurs dans la console

### 2. Intercepteur axios corrigé
- ✅ Ne redirige plus vers /login si on est déjà sur /login
- ✅ Évite le rafraîchissement de page

### 3. AuthController amélioré
- ✅ Meilleur logging
- ✅ Messages d'erreur plus clairs

---

## 🧪 Tests à Effectuer

### Test 1: Vérifier la console du navigateur
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet Console
3. Essayer de se connecter
4. Vérifier les erreurs affichées

### Test 2: Vérifier l'onglet Network
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet Network
3. Essayer de se connecter
4. Vérifier la requête POST vers `/api/auth/login`
5. Vérifier la réponse (status, body)

### Test 3: Tester l'API directement
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"agent1","password":"password123"}'
```

**Résultat attendu:**
```json
{
  "token": "eyJhbGc...",
  "username": "agent1",
  "message": "Authentication successful",
  "role": "AGENT"
}
```

### Test 4: Vérifier que les services sont démarrés
```bash
# Vérifier que l'API Gateway tourne
curl http://localhost:8080/actuator/health

# Vérifier que Client Service tourne
curl http://localhost:8082/actuator/health
```

---

## 🔍 Causes Possibles

### 1. Services backend non démarrés
**Solution:** Redémarrer les services
```bash
./stop-all-services.sh
./start-all-services.sh
```

### 2. Utilisateurs non créés dans la base de données
**Solution:** Exécuter le script SQL
```bash
mysql -u root -p1234567 < sql/create-users-table.sql
```

### 3. Erreur CORS
**Symptôme:** Erreur dans la console "CORS policy"
**Solution:** Vérifier CorsConfig dans api-gateway

### 4. Erreur Feign (client-service non accessible)
**Symptôme:** Erreur 500 dans les logs
**Solution:** Vérifier que client-service est enregistré dans Eureka

### 5. Hash BCrypt incorrect
**Symptôme:** Erreur 401 même avec le bon mot de passe
**Solution:** Vérifier que le hash dans la base correspond à "password123"

---

## 📝 Checklist de Diagnostic

- [ ] Services backend démarrés (API Gateway, Client Service)
- [ ] Utilisateurs créés dans la base de données
- [ ] Pas d'erreur CORS dans la console
- [ ] Requête POST visible dans Network tab
- [ ] Réponse API visible (status 200 ou 401)
- [ ] Pas d'erreur JavaScript dans la console
- [ ] Token stocké dans localStorage après login réussi

---

## 🚀 Solution Rapide

Si le problème persiste:

1. **Vider le cache du navigateur:**
   - Chrome: Ctrl+Shift+Delete
   - Ou ouvrir en navigation privée

2. **Vérifier localStorage:**
   ```javascript
   // Dans la console du navigateur
   localStorage.clear();
   ```

3. **Redémarrer tous les services:**
   ```bash
   ./stop-all-services.sh
   sleep 5
   ./start-all-services.sh
   ```

4. **Vérifier les logs:**
   ```bash
   tail -f logs/api-gateway.log | grep -i auth
   tail -f logs/client-service.log | grep -i user
   ```

---

## 💡 Messages d'Erreur Possibles

### "Impossible de contacter le serveur"
→ Les services backend ne sont pas démarrés

### "Identifiants incorrects"
→ Le username/password est incorrect OU l'utilisateur n'existe pas

### "Erreur serveur"
→ Problème dans client-service (Feign error, base de données, etc.)

### "Token non reçu"
→ L'API retourne une réponse mais sans token (problème d'authentification)

---

**Après ces corrections, les erreurs devraient être affichées clairement dans l'interface au lieu de simplement rafraîchir la page.**

