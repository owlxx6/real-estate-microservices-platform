package com.realestate.gateway.config;

import com.realestate.gateway.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                // Property Service Routes (requires authentication)
                .route("property-service", r -> r
                        .path("/api/properties/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://property-service"))
                
                // Client Service Routes (requires authentication)
                .route("client-service-clients", r -> r
                        .path("/api/clients/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://client-service"))
                
                .route("client-service-agents", r -> r
                        .path("/api/agents/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://client-service"))
                
                .route("client-service-visits", r -> r
                        .path("/api/visits/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://client-service"))
                
                // Interface Service Routes (requires authentication)
                .route("interface-service", r -> r
                        .path("/api/dashboard/**", "/api/search/**", "/api/bookings/**")
                        .filters(f -> f.filter(jwtAuthenticationFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://interface-service"))
                
                // Auth Routes (no authentication required)
                .route("auth-service", r -> r
                        .path("/api/auth/**")
                        .uri("lb://api-gateway")) // Handle auth in gateway itself
                
                .build();
    }
}

