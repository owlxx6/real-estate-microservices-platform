package com.realestate.gateway.filter;

import com.realestate.gateway.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {
    
    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    @Autowired
    private JwtUtil jwtUtil;
    
    public JwtAuthenticationFilter() {
        super(Config.class);
    }
    
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();
            String method = request.getMethod().name();
            
            // Skip authentication for login endpoint
            if (path.contains("/api/auth/login")) {
                return chain.filter(exchange);
            }
            
            // Allow public access to view properties (GET requests only)
            if (method.equals("GET") && (
                path.contains("/api/properties/search") || 
                path.matches("/api/properties(/\\d+)?$")
            )) {
                log.info("Public access granted for: {} {}", method, path);
                return chain.filter(exchange);
            }
            
            // Check for Authorization header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                log.error("Authentication error: No Authorization header");
                return onError(exchange, "No Authorization header", HttpStatus.UNAUTHORIZED);
            }
            
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }
            
            String token = authHeader.substring(7);
            
            try {
                if (!jwtUtil.isTokenValid(token)) {
                    log.error("JWT validation failed: Token is invalid or expired");
                    return onError(exchange, "Invalid or expired token", HttpStatus.UNAUTHORIZED);
                }
                
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                String email = jwtUtil.extractEmail(token);
                log.info("Request authenticated for user: {} with role: {} and email: {} - Path: {}", username, role, email, path);
                
                // Normalize role: ensure it has ROLE_ prefix for Spring Security compatibility
                String normalizedRole = normalizeRole(role);
                log.info("Role normalized: {} -> {} (for path: {})", role, normalizedRole, path);
                
                // Add username, role (with ROLE_ prefix), and email to request headers
                ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
                        .header("X-User-Name", username)
                        .header("X-User-Role", normalizedRole)
                        .header("X-User-Email", email != null ? email : "")
                        .build();
                
                log.debug("Headers added - X-User-Name: {}, X-User-Role: {}, X-User-Email: {}", 
                        username, normalizedRole, email != null ? email : "");
                
                return chain.filter(exchange.mutate().request(modifiedRequest).build());
                
            } catch (Exception e) {
                log.error("JWT validation error for path {}: {} - Exception type: {}", path, e.getMessage(), e.getClass().getName());
                if (e.getCause() != null) {
                    log.error("JWT validation error cause: {}", e.getCause().getMessage());
                }
                e.printStackTrace();
                return onError(exchange, "JWT validation failed: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            }
        };
    }
    
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
    
    private Mono<Void> onError(ServerWebExchange exchange, String error, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }
    
    public static class Config {
        // Configuration properties if needed
    }
}
