# Correction du mapping des rôles JWT - Préfixe ROLE_

## Problème

Les endpoints protégés retournaient 401 Unauthorized pour ADMIN, même si :
- Le backend compile correctement
- Le login ADMIN fonctionne
- Le JWT est transmis via l'API Gateway

## Cause

Le Gateway transmettait les rôles sans le préfixe "ROLE_" requis par Spring Security. Spring Security's `hasRole()` s'attend à des rôles avec le préfixe "ROLE_" (ex: "ROLE_ADMIN" au lieu de "ADMIN").

## Solution appliquée

### 1. API Gateway - Normalisation des rôles

**Fichier modifié:** `api-gateway/src/main/java/com/realestate/gateway/filter/JwtAuthenticationFilter.java`

**Changements:**
- Ajout de la méthode `normalizeRole()` qui ajoute le préfixe "ROLE_" aux rôles
- Le header `X-User-Role` contient maintenant "ROLE_ADMIN", "ROLE_AGENT", "ROLE_CLIENT"
- Gestion des cas où le rôle est null ou vide (défaut: "ROLE_AGENT")
- Évite la duplication du préfixe si déjà présent

**Code ajouté:**
```java
/**
 * Normalize role to include ROLE_ prefix for Spring Security compatibility.
 * Spring Security's hasRole() method expects roles with ROLE_ prefix.
 * 
 * @param role The role from JWT token (e.g., "ADMIN", "AGENT", "CLIENT")
 * @return Normalized role with ROLE_ prefix (e.g., "ROLE_ADMIN")
 */
private String normalizeRole(String role) {
    if (role == null || role.isEmpty()) {
        return "ROLE_AGENT"; // Default role
    }
    
    // Remove any existing ROLE_ prefix to avoid duplication
    String cleanRole = role.startsWith("ROLE_") ? role.substring(6) : role;
    
    // Add ROLE_ prefix for Spring Security compatibility
    return "ROLE_" + cleanRole.toUpperCase();
}
```

**Utilisation:**
```java
// Normalize role: ensure it has ROLE_ prefix for Spring Security compatibility
String normalizedRole = normalizeRole(role);

// Add username, role (with ROLE_ prefix), and email to request headers
ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
        .header("X-User-Name", username)
        .header("X-User-Role", normalizedRole)  // Now contains "ROLE_ADMIN"
        .header("X-User-Email", email != null ? email : "")
        .build();
```

### 2. Interface Service - Adaptation du RoleChecker

**Fichier modifié:** `interface-service/src/main/java/com/realestate/interfaceapi/util/RoleChecker.java`

**Changements:**
- Adaptation de `getRoleFromRequest()` pour gérer le préfixe "ROLE_"
- Suppression automatique du préfixe "ROLE_" avant comparaison avec l'enum
- Compatibilité avec les deux formats (avec et sans préfixe)

**Code modifié:**
```java
public String getRoleFromRequest(HttpServletRequest request) {
    String role = request.getHeader("X-User-Role");
    log.debug("Extracting role from request header X-User-Role: {}", role);
    
    if (role == null || role.isEmpty()) {
        log.warn("X-User-Role header is missing or empty, defaulting to CLIENT");
        return "CLIENT"; // Default to CLIENT if not present
    }
    
    // Normalize role: remove ROLE_ prefix if present, then uppercase
    String cleanRole = role.startsWith("ROLE_") ? role.substring(6) : role;
    String normalizedRole = cleanRole.toUpperCase().trim();
    log.debug("Normalized role (removed ROLE_ prefix): {}", normalizedRole);
    return normalizedRole;
}
```

## Résultats attendus

### Avant la correction
- Header `X-User-Role`: "ADMIN"
- Spring Security `hasRole("ADMIN")`: ❌ Échec (cherche "ROLE_ADMIN")
- Endpoints protégés: ❌ 401 Unauthorized

### Après la correction
- Header `X-User-Role`: "ROLE_ADMIN"
- Spring Security `hasRole("ADMIN")`: ✅ Succès (cherche "ROLE_ADMIN")
- Endpoints protégés: ✅ 200 OK pour ADMIN

## Mapping des rôles

| Rôle JWT | Header X-User-Role | Spring Security |
|----------|-------------------|-----------------|
| "ADMIN" | "ROLE_ADMIN" | `hasRole("ADMIN")` ✅ |
| "AGENT" | "ROLE_AGENT" | `hasRole("AGENT")` ✅ |
| "CLIENT" | "ROLE_CLIENT" | `hasRole("CLIENT")` ✅ |

## Tests

### Test de normalisation
```java
normalizeRole("ADMIN")     → "ROLE_ADMIN"
normalizeRole("ROLE_ADMIN") → "ROLE_ADMIN" (pas de duplication)
normalizeRole("agent")     → "ROLE_AGENT" (uppercase)
normalizeRole(null)        → "ROLE_AGENT" (défaut)
```

### Test d'extraction
```java
getRoleFromRequest("ROLE_ADMIN") → "ADMIN" (préfixe supprimé)
getRoleFromRequest("ADMIN")      → "ADMIN" (pas de préfixe)
getRoleFromRequest("role_admin") → "ADMIN" (uppercase)
```

## Notes

- ✅ Le contenu du JWT n'a pas été modifié (le rôle reste "ADMIN" dans le token)
- ✅ Le frontend n'a pas été modifié
- ✅ Seuls le Gateway et le RoleChecker ont été adaptés
- ✅ Compatibilité ascendante maintenue (gère les deux formats)

## Prochaines étapes

1. Redémarrer le Gateway pour appliquer les changements
2. Tester l'accès au dashboard avec le compte ADMIN
3. Vérifier que les endpoints protégés sont accessibles

## Commandes de test

```bash
# Obtenir un token ADMIN
TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

# Tester l'accès au dashboard
curl -X GET "http://localhost:8080/api/dashboard/statistics" \
  -H "Authorization: Bearer $TOKEN"
```

**Résultat attendu:** HTTP 200 OK avec les statistiques du dashboard

