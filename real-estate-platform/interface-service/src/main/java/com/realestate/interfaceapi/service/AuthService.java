package com.realestate.interfaceapi.service;

import com.realestate.interfaceapi.dto.AuthRequestDTO;
import com.realestate.interfaceapi.dto.AuthResponse;
import com.realestate.interfaceapi.dto.UserDTO;
import com.realestate.interfaceapi.feign.ClientServiceClient;
import com.realestate.interfaceapi.util.JwtUtil;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final ClientServiceClient clientServiceClient;
    private final JwtUtil jwtUtil;
    
    public AuthResponse authenticate(String username, String password) {
        try {
            log.info("=== AUTHENTICATION START ===");
            log.info("Attempting authentication for user: {}", username);
            log.info("Password provided: {}", password != null ? "***" : "null");
            
            // Authenticate user via client-service using OpenFeign
            AuthRequestDTO authRequest = new AuthRequestDTO(username, password);
            log.info("AuthRequestDTO created: username={}", authRequest.getUsername());
            
            UserDTO user = null;
            try {
                log.info("Calling client-service via Feign: POST /api/users/authenticate");
                user = clientServiceClient.authenticate(authRequest);
                log.info("Feign call completed successfully");
            } catch (FeignException e) {
                log.error("=== FEIGN EXCEPTION DETAILS ===");
                log.error("Status code: {}", e.status());
                log.error("Error message: {}", e.getMessage());
                log.error("Request URL: {}", e.request() != null ? e.request().url() : "unknown");
                if (e.contentUTF8() != null) {
                    log.error("Response body: {}", e.contentUTF8());
                }
                log.error("=== END FEIGN EXCEPTION ===");
                
                if (e.status() == 401) {
                    log.warn("Invalid credentials for user: {} (HTTP 401)", username);
                    return new AuthResponse(null, null, "Invalid credentials", null);
                } else if (e.status() == 404) {
                    log.warn("User not found: {} (HTTP 404)", username);
                    return new AuthResponse(null, null, "User not found", null);
                } else {
                    log.error("Unexpected HTTP status: {} for user: {}", e.status(), username);
                    return new AuthResponse(null, null, "Authentication service error: " + e.status(), null);
                }
            }
            
            log.info("=== FEIGN RESPONSE ANALYSIS ===");
            log.info("User DTO received: {}", user != null ? "NOT NULL" : "NULL");
            if (user != null) {
                log.info("User ID: {}", user.getId());
                log.info("Username: {}", user.getUsername());
                log.info("Email: {}", user.getEmail());
                log.info("Role: {}", user.getRole());
                log.info("IsActive: {}", user.getIsActive());
                log.info("AgentId: {}", user.getAgentId());
                log.info("ClientId: {}", user.getClientId());
            }
            log.info("=== END FEIGN RESPONSE ANALYSIS ===");
            
            if (user == null) {
                log.warn("User is null for username: {}", username);
                return new AuthResponse(null, null, "Invalid credentials - user not found", null);
            }
            
            if (!user.getIsActive()) {
                log.warn("User is inactive: {} (isActive={})", username, user.getIsActive());
                return new AuthResponse(null, null, "User account is inactive", null);
            }
            
            if (user.getRole() == null || user.getRole().isEmpty()) {
                log.error("User role is null or empty for username: {}", username);
                return new AuthResponse(null, null, "User role is missing", null);
            }
            
            log.info("=== JWT TOKEN GENERATION ===");
            log.info("Generating token for: username={}, role={}, email={}", 
                    user.getUsername(), user.getRole(), user.getEmail());
            
            // Generate JWT token with role and email
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getEmail());
            
            log.info("Token generated successfully: {}", token != null ? token.substring(0, Math.min(50, token.length())) + "..." : "NULL");
            log.info("=== END JWT TOKEN GENERATION ===");
            
            log.info("=== AUTHENTICATION SUCCESS ===");
            log.info("User authenticated successfully: {} with role: {}", username, user.getRole());
            log.info("=== END AUTHENTICATION ===");
            
            return new AuthResponse(token, user.getUsername(), "Authentication successful", user.getRole());
        } catch (Exception e) {
            log.error("=== UNEXPECTED EXCEPTION ===");
            log.error("Exception type: {}", e.getClass().getName());
            log.error("Exception message: {}", e.getMessage());
            log.error("Stack trace:", e);
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
                log.error("Cause stack trace:", e.getCause());
            }
            log.error("=== END UNEXPECTED EXCEPTION ===");
            return new AuthResponse(null, null, "Authentication failed: " + e.getMessage(), null);
        }
    }
}

