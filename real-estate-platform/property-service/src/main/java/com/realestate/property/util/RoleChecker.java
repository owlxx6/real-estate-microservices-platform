package com.realestate.property.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class RoleChecker {
    
    public enum Role {
        ADMIN, AGENT, CLIENT
    }
    
    public String getRoleFromRequest(HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        log.debug("Extracting role from request header X-User-Role: {}", role);
        
        if (role == null || role.isEmpty()) {
            log.warn("X-User-Role header is missing or empty, defaulting to CLIENT");
            return "CLIENT"; // Default to CLIENT if not present
        }
        
        // Normalize role: remove ROLE_ prefix if present, then uppercase
        String cleanRole = role.startsWith("ROLE_") ? role.substring(5) : role;
        String normalizedRole = cleanRole.toUpperCase().trim();
        log.debug("Normalized role (removed ROLE_ prefix): {}", normalizedRole);
        return normalizedRole;
    }
    
    public boolean hasRole(HttpServletRequest request, Role requiredRole) {
        String userRole = getRoleFromRequest(request);
        boolean hasRole = userRole.equals(requiredRole.name());
        log.debug("Checking role: userRole={}, requiredRole={}, result={}", userRole, requiredRole.name(), hasRole);
        return hasRole;
    }
    
    public boolean hasAnyRole(HttpServletRequest request, Role... roles) {
        String userRole = getRoleFromRequest(request);
        for (Role role : roles) {
            if (userRole.equals(role.name())) {
                log.debug("User has role {} (one of required roles)", role.name());
                return true;
            }
        }
        log.debug("User role {} does not match any of the required roles", userRole);
        return false;
    }
    
    public boolean isAdmin(HttpServletRequest request) {
        return hasRole(request, Role.ADMIN);
    }
    
    public boolean isAgentOrAdmin(HttpServletRequest request) {
        return hasAnyRole(request, Role.AGENT, Role.ADMIN);
    }
    
    public boolean isClient(HttpServletRequest request) {
        return hasRole(request, Role.CLIENT);
    }
    
    public void checkRole(HttpServletRequest request, Role requiredRole) {
        if (!hasRole(request, requiredRole)) {
            String userRole = getRoleFromRequest(request);
            log.error("Access denied: User role {} does not match required role {}", userRole, requiredRole.name());
            throw new SecurityException("Access denied: Required role " + requiredRole.name() + ", but user has role " + userRole);
        }
    }
    
    public void checkAnyRole(HttpServletRequest request, Role... roles) {
        String rawRole = request.getHeader("X-User-Role");
        String normalizedRole = getRoleFromRequest(request);
        String endpoint = request.getRequestURI();
        String method = request.getMethod();
        
        log.info("=== PROPERTY-SERVICE RoleChecker.checkAnyRole ===");
        log.info("Endpoint: {} {}", method, endpoint);
        log.info("X-User-Role (raw): {}", rawRole);
        log.info("X-User-Role (normalized): {}", normalizedRole);
        log.info("Required roles: {}", java.util.Arrays.toString(roles));
        
        if (!hasAnyRole(request, roles)) {
            log.error("=== PROPERTY-SERVICE ACCESS DENIED ===");
            log.error("User role '{}' does not match any of the required roles {}", normalizedRole, java.util.Arrays.toString(roles));
            throw new SecurityException("Access denied: Required one of roles " + java.util.Arrays.toString(roles) + ", but user has role " + normalizedRole);
        }
        log.info("=== PROPERTY-SERVICE ACCESS GRANTED ===");
        log.debug("Access granted: User role matches one of the required roles");
    }
}

