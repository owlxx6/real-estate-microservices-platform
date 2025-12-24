package com.realestate.interfaceapi.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.realestate.interfaceapi.dto.AuthRequestDTO;
import com.realestate.interfaceapi.dto.AuthResponse;
import com.realestate.interfaceapi.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "User authentication APIs")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    @Operation(summary = "Authenticate user and get JWT token")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequestDTO request) {
        try {
            log.info("Login attempt for username: {}", request.getUsername());
            
            AuthResponse response = authService.authenticate(request.getUsername(), request.getPassword());
            
            log.info("AuthService returned response: token={}, username={}, role={}, message={}", 
                    response.getToken() != null ? "present" : "null",
                    response.getUsername(),
                    response.getRole(),
                    response.getMessage());
            
            if (response.getToken() == null) {
                log.warn("Login failed for username: {} - {}", request.getUsername(), response.getMessage());
                return ResponseEntity.status(401).body(response);
            }
            
            log.info("Login successful for username: {}, preparing response", request.getUsername());
            
            // Vérifier que tous les champs sont valides avant de retourner
            if (response.getUsername() == null || response.getRole() == null) {
                log.error("Response has null fields: username={}, role={}", response.getUsername(), response.getRole());
                AuthResponse errorResponse = new AuthResponse();
                errorResponse.setToken(null);
                errorResponse.setUsername(null);
                errorResponse.setMessage("Invalid response data");
                errorResponse.setRole(null);
                return ResponseEntity.status(500).body(errorResponse);
            }
            
            log.info("Returning successful response for username: {}", request.getUsername());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("=== EXCEPTION IN AUTH CONTROLLER ===");
            log.error("Exception type: {}", e.getClass().getName());
            log.error("Exception message: {}", e.getMessage());
            log.error("Stack trace:", e);
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getMessage());
                log.error("Cause stack trace:", e.getCause());
            }
            log.error("=== END EXCEPTION IN CONTROLLER ===");
            AuthResponse errorResponse = new AuthResponse();
            errorResponse.setToken(null);
            errorResponse.setUsername(null);
            errorResponse.setMessage("Internal server error: " + (e.getMessage() != null ? e.getMessage() : "Unknown error"));
            errorResponse.setRole(null);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}

