package com.realestate.client.util;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class RequestHeaderUtil {
    
    public String getEmailFromRequest(HttpServletRequest request) {
        String email = request.getHeader("X-User-Email");
        log.debug("Extracting email from request header X-User-Email: {}", email);
        return email;
    }
    
    public String getRoleFromRequest(HttpServletRequest request) {
        String role = request.getHeader("X-User-Role");
        log.debug("Extracting role from request header X-User-Role: {}", role);
        return role;
    }
    
    public String getUsernameFromRequest(HttpServletRequest request) {
        return request.getHeader("X-User-Name");
    }
}

