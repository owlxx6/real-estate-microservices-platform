package com.realestate.gateway.dto;

public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String role;
    private Long agentId;
    private Long clientId;
    private Boolean isActive;
    
    // Default constructor
    public UserDTO() {
    }
    
    // All-args constructor
    public UserDTO(Long id, String username, String email, String role, Long agentId, Long clientId, Boolean isActive) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.agentId = agentId;
        this.clientId = clientId;
        this.isActive = isActive;
    }
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public Long getAgentId() {
        return agentId;
    }
    
    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }
    
    public Long getClientId() {
        return clientId;
    }
    
    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

