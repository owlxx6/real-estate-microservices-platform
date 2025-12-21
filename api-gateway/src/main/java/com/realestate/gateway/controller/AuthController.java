package com.realestate.gateway.controller;

import com.realestate.gateway.dto.AuthRequest;
import com.realestate.gateway.dto.AuthResponse;
import com.realestate.gateway.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final JwtUtil jwtUtil;
    
    /**
     * Simple login endpoint for demo purposes
     * In production, this should validate against a user service
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest authRequest) {
        log.info("Login attempt for user: {}", authRequest.getUsername());
        
        // Simple demo authentication - accept any username/password
        // In production, validate against user service
        if (authRequest.getUsername() != null && !authRequest.getUsername().isEmpty() &&
            authRequest.getPassword() != null && !authRequest.getPassword().isEmpty()) {
            
            String token = jwtUtil.generateToken(authRequest.getUsername());
            
            AuthResponse response = new AuthResponse();
            response.setToken(token);
            response.setUsername(authRequest.getUsername());
            response.setMessage("Authentication successful");
            
            log.info("Login successful for user: {}", authRequest.getUsername());
            return ResponseEntity.ok(response);
        }
        
        log.warn("Login failed for user: {}", authRequest.getUsername());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponse(null, null, "Invalid credentials"));
    }
    
    @PostMapping("/validate")
    public ResponseEntity<String> validateToken(@RequestHeader("Authorization") String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.validateToken(token)) {
                String username = jwtUtil.getUsernameFromToken(token);
                return ResponseEntity.ok("Token is valid for user: " + username);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token");
    }
}

