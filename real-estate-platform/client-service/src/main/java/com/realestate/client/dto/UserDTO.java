package com.realestate.client.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String role;  // String instead of enum for Feign compatibility
    private Long agentId;
    private Long clientId;
    private Boolean isActive;
}

