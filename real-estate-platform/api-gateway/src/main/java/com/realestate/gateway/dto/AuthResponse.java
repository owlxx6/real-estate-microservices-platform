package com.realestate.gateway.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String message;
    private String role;
    
    // Default constructor
    public AuthResponse() {
    }
    
    // All-args constructor
    public AuthResponse(String token, String username, String message, String role) {
        this.token = token;
        this.username = username;
        this.message = message;
        this.role = role;
    }
    
    // Constructor for backward compatibility
    public AuthResponse(String token, String username, String message) {
        this.token = token;
        this.username = username;
        this.message = message;
        this.role = "AGENT"; // Default
    }
    
    // Getters and setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
}
