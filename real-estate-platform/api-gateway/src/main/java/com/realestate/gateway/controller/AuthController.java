package com.realestate.gateway.controller;

import com.realestate.gateway.dto.AuthRequest;
import com.realestate.gateway.dto.AuthResponse;
import com.realestate.gateway.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final JwtUtil jwtUtil;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        // Simplified authentication - in production, verify against database
        if ("agent1".equals(request.getUsername()) && "password123".equals(request.getPassword())) {
            String token = jwtUtil.generateToken(request.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, request.getUsername(), "Authentication successful"));
        }
        return ResponseEntity.status(401).body(new AuthResponse(null, null, "Invalid credentials"));
    }
}
