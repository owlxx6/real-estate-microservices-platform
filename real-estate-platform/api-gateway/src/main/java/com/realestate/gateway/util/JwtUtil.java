package com.realestate.gateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    private SecretKey getSigningKey() {
        System.out.println("JWT Secret length: " + (secret != null ? secret.length() : 0));
        System.out.println("JWT Secret (first 50 chars): " + (secret != null ? secret.substring(0, Math.min(50, secret.length())) : "NULL"));
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
    
    public String generateToken(String username, String role, String email) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .claim("email", email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    public String generateToken(String username, String role) {
        return generateToken(username, role, ""); // Default for backward compatibility
    }
    
    public String generateToken(String username) {
        return generateToken(username, "AGENT"); // Default for backward compatibility
    }
    
    public String extractRole(String token) {
        Claims claims = extractClaims(token);
        return claims.get("role", String.class);
    }
    
    public String extractEmail(String token) {
        Claims claims = extractClaims(token);
        return claims.get("email", String.class);
    }
    
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }
    
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractClaims(token);
            boolean isValid = claims.getExpiration().after(new Date());
            System.out.println("JWT Validation - Token valid: " + isValid + ", Expiration: " + claims.getExpiration());
            return isValid;
        } catch (Exception e) {
            System.err.println("JWT Validation Error: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
