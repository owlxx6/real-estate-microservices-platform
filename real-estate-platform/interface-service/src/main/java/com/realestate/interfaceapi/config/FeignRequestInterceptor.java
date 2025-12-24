package com.realestate.interfaceapi.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Feign Request Interceptor to forward headers from incoming HTTP request
 * to downstream microservices via Feign clients.
 * 
 * This ensures that:
 * - Authorization header (JWT token) is forwarded
 * - X-User-Role header is forwarded
 * - X-User-Name header is forwarded
 * - X-User-Email header is forwarded
 */
@Component
@Slf4j
public class FeignRequestInterceptor implements RequestInterceptor {
    
    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            
            // Forward Authorization header (JWT token)
            String authorization = request.getHeader("Authorization");
            if (authorization != null && !authorization.isEmpty()) {
                template.header("Authorization", authorization);
                log.debug("FeignRequestInterceptor: Forwarded Authorization header to downstream service: {}", template.url());
            } else {
                log.warn("FeignRequestInterceptor: Authorization header is missing for request: {}", template.url());
            }
            
            // Forward X-User-Role header (critical for role-based access control)
            String userRole = request.getHeader("X-User-Role");
            if (userRole != null && !userRole.isEmpty()) {
                template.header("X-User-Role", userRole);
                log.info("FeignRequestInterceptor: Forwarded X-User-Role header: {} for request: {}", userRole, template.url());
            } else {
                log.error("FeignRequestInterceptor: X-User-Role header is missing in incoming request for {} - this will cause authorization failures", template.url());
            }
            
            // Forward X-User-Name header
            String userName = request.getHeader("X-User-Name");
            if (userName != null && !userName.isEmpty()) {
                template.header("X-User-Name", userName);
                log.debug("FeignRequestInterceptor: Forwarded X-User-Name header: {} for request: {}", userName, template.url());
            }
            
            // Forward X-User-Email header
            String userEmail = request.getHeader("X-User-Email");
            if (userEmail != null && !userEmail.isEmpty()) {
                template.header("X-User-Email", userEmail);
                log.debug("FeignRequestInterceptor: Forwarded X-User-Email header: {} for request: {}", userEmail, template.url());
            }
        } else {
            log.error("FeignRequestInterceptor: RequestContextHolder has no request attributes - cannot forward headers for request: {}", template.url());
        }
    }
}

