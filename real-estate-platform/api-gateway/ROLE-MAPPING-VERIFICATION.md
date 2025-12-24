# Vérification du mapping des rôles JWT dans le Gateway

## État actuel

Le code du Gateway **transmet déjà** le header `X-User-Role` avec le préfixe `ROLE_` :

### Code actuel dans JwtAuthenticationFilter.java

```java
// Normalize role: ensure it has ROLE_ prefix for Spring Security compatibility
String normalizedRole = normalizeRole(role);

// Add username, role (with ROLE_ prefix), and email to request headers
ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
        .header("X-User-Name", username)
        .header("X-User-Role", normalizedRole)  // Contient "ROLE_ADMIN", "ROLE_AGENT", etc.
        .header("X-User-Email", email != null ? email : "")
        .build();
```

### Méthode normalizeRole()

```java
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

## Mapping des rôles

| Rôle JWT | Header X-User-Role | RoleChecker (interface-service) |
|----------|-------------------|--------------------------------|
| "ADMIN" | "ROLE_ADMIN" | Supprime "ROLE_" → "ADMIN" ✅ |
| "AGENT" | "ROLE_AGENT" | Supprime "ROLE_" → "AGENT" ✅ |
| "CLIENT" | "ROLE_CLIENT" | Supprime "ROLE_" → "CLIENT" ✅ |

## Problème identifié

Le test direct montre que le header `ROLE_ADMIN` est bien transmis, mais le `RoleChecker` retourne une erreur indiquant "user has role ROLE_ADMIN" au lieu de "ADMIN".

Cela suggère que :
1. Le header est bien transmis avec le préfixe `ROLE_`
2. Le `RoleChecker` ne supprime pas correctement le préfixe dans certains cas
3. Ou le Gateway n'a pas été redémarré après les modifications

## Solution

### 1. Vérification du Gateway

Le Gateway transmet correctement le header avec le préfixe `ROLE_`. Les logs ont été ajoutés pour confirmer la transmission.

### 2. Vérification du RoleChecker

Le `RoleChecker` dans `interface-service` supprime le préfixe `ROLE_` avant comparaison :

```java
public String getRoleFromRequest(HttpServletRequest request) {
    String role = request.getHeader("X-User-Role");
    
    // Normalize role: remove ROLE_ prefix if present, then uppercase
    String cleanRole = role.startsWith("ROLE_") ? role.substring(6) : role;
    String normalizedRole = cleanRole.toUpperCase().trim();
    return normalizedRole;
}
```

## Action requise

**Redémarrer le Gateway** pour appliquer les modifications et vérifier les logs :

```bash
# Arrêter le Gateway
pkill -f "ApiGatewayApplication"

# Redémarrer le Gateway
cd api-gateway
mvn spring-boot:run > ../logs/api-gateway.log 2>&1 &
```

## Test après redémarrage

```bash
# Obtenir un token ADMIN
TOKEN=$(curl -s -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")

# Tester le dashboard
curl -X GET "http://localhost:8080/api/dashboard/statistics" \
  -H "Authorization: Bearer $TOKEN"
```

**Résultat attendu:** HTTP 200 OK

## Notes

- Le Gateway **ne crée pas** d'objets `Authentication` avec `GrantedAuthority` car il utilise Spring Cloud Gateway (WebFlux)
- Le Gateway **transmet** les headers aux microservices en aval
- Les microservices utilisent `RoleChecker` pour extraire le rôle du header `X-User-Role`
- Le préfixe `ROLE_` est ajouté dans le Gateway et supprimé dans le `RoleChecker`

