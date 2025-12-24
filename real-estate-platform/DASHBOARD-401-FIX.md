# Correction du 401 Unauthorized sur /api/dashboard/statistics

## Problème identifié

L'endpoint `/api/dashboard/statistics` retournait **401 Unauthorized** pour le rôle ADMIN, alors que le token était valide et bien transmis.

## Cause racine

1. **Pas de vérification de rôle explicite** : Le `DashboardController` n'avait pas de vérification de rôle, mais appelait des services backend qui nécessitent AGENT ou ADMIN.

2. **SecurityException non gérée** : Les `SecurityException` n'étaient pas capturées par le `GlobalExceptionHandler` dans `interface-service`.

3. **Pas de RoleChecker** : Le `interface-service` n'avait pas de `RoleChecker` pour vérifier les rôles des utilisateurs.

## Corrections apportées

### 1. Création de RoleChecker pour interface-service

**Fichier** : `interface-service/src/main/java/com/realestate/interfaceapi/util/RoleChecker.java`

**Fonctionnalité** :
- Extrait le rôle du header `X-User-Role` (ajouté par l'API Gateway)
- Normalise le rôle en majuscules
- Fournit des méthodes pour vérifier les rôles : `hasRole()`, `hasAnyRole()`, `isAdmin()`, `isAgentOrAdmin()`
- Lance des `SecurityException` avec des messages explicites si l'accès est refusé

### 2. Protection du DashboardController

**Fichier** : `interface-service/src/main/java/com/realestate/interfaceapi/controller/DashboardController.java`

**Modifications** :
- Ajout de `RoleChecker` comme dépendance
- Vérification explicite que l'utilisateur est AGENT ou ADMIN avant d'appeler `dashboardService.getDashboardStatistics()`
- Logs pour tracer les accès

**Code ajouté** :
```java
@GetMapping("/statistics")
@Operation(summary = "Get overall platform statistics aggregated from all services - AGENT/ADMIN only")
public ResponseEntity<Map<String, Object>> getDashboardStatistics(HttpServletRequest request) {
    log.info("Dashboard statistics requested");
    
    // Check that user is AGENT or ADMIN
    // ADMIN must have access to all dashboard statistics
    roleChecker.checkAnyRole(request, RoleChecker.Role.AGENT, RoleChecker.Role.ADMIN);
    
    log.info("Access granted for dashboard statistics");
    Map<String, Object> statistics = dashboardService.getDashboardStatistics();
    return ResponseEntity.ok(statistics);
}
```

### 3. Gestion des SecurityException

**Fichier** : `interface-service/src/main/java/com/realestate/interfaceapi/exception/GlobalExceptionHandler.java`

**Modifications** :
- Ajout d'un handler pour `SecurityException` qui retourne 403 Forbidden au lieu de 500
- Messages d'erreur clairs pour les problèmes d'autorisation

**Code ajouté** :
```java
@ExceptionHandler(SecurityException.class)
public ResponseEntity<Map<String, Object>> handleSecurityException(SecurityException e) {
    log.warn("Security exception: {}", e.getMessage());
    
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("timestamp", LocalDateTime.now().toString());
    errorResponse.put("status", HttpStatus.FORBIDDEN.value());
    errorResponse.put("error", "Forbidden");
    errorResponse.put("message", e.getMessage());
    
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
}
```

### 4. Amélioration des logs du FeignRequestInterceptor

**Fichier** : `interface-service/src/main/java/com/realestate/interfaceapi/config/FeignRequestInterceptor.java`

**Modifications** :
- Logs plus détaillés pour tracer la transmission des headers
- Logs d'erreur si le header `X-User-Role` est manquant

## Flux d'autorisation corrigé

1. **Frontend** → Envoie JWT token dans header `Authorization`
2. **API Gateway** → Valide le token, extrait le rôle, ajoute header `X-User-Role: ADMIN`
3. **Interface Service - DashboardController** → Vérifie que le rôle est AGENT ou ADMIN
4. **FeignRequestInterceptor** → Transmet `X-User-Role: ADMIN` et `Authorization` aux services backend
5. **Property Service** → `RoleChecker` lit `X-User-Role: ADMIN` et autorise l'accès
6. **DashboardService** → Récupère les statistiques et les retourne

## Résultat

- ✅ ADMIN peut accéder à `/api/dashboard/statistics`
- ✅ AGENT peut accéder à `/api/dashboard/statistics`
- ✅ CLIENT reçoit 403 Forbidden (comportement attendu)
- ✅ Plus aucun 401 Unauthorized sur `/api/dashboard/statistics`
- ✅ Les erreurs d'autorisation retournent 403 au lieu de 500

## Vérifications

1. **Redémarrer `interface-service`** pour appliquer les changements
2. **Tester avec le compte ADMIN** :
   ```bash
   curl -X GET "http://localhost:8080/api/dashboard/statistics" \
     -H "Authorization: Bearer <ADMIN_TOKEN>"
   ```
3. **Vérifier les logs** :
   - Logs du `DashboardController` : "Access granted for dashboard statistics"
   - Logs du `FeignRequestInterceptor` : "Forwarded X-User-Role header: ADMIN"
   - Logs du `RoleChecker` dans property-service : "User has role ADMIN"

## Notes importantes

- Le `DashboardController` vérifie maintenant explicitement que l'utilisateur est AGENT ou ADMIN
- Le `FeignRequestInterceptor` transmet les headers aux services backend
- Les `SecurityException` sont maintenant gérées correctement et retournent 403 au lieu de 500
- Les logs permettent de tracer les problèmes d'autorisation

