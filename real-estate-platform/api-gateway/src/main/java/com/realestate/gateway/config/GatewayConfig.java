package com.realestate.gateway.config;

import com.realestate.gateway.filter.JwtAuthenticationFilter;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder, JwtAuthenticationFilter jwtFilter) {
        return builder.routes()
                // Property Service routes
                .route("property-service", r -> r
                        .path("/api/properties/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://property-service"))
                
                // Sale Property routes (property-service)
                .route("sale-properties", r -> r
                        .path("/api/sales/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://property-service"))
                
                // Client Service routes
                .route("client-service-clients", r -> r
                        .path("/api/clients/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://client-service"))
                
                .route("client-service-agents", r -> r
                        .path("/api/agents/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://client-service"))
                
                .route("client-service-visits", r -> r
                        .path("/api/visits/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://client-service"))
                
                // Interface Service routes
                .route("interface-service", r -> r
                        .path("/api/dashboard/**", "/api/search/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://interface-service"))
                
                // Rental Service routes
                .route("rental-service-rentals", r -> r
                        .path("/api/rentals/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://rental-service"))
                
                .route("rental-service-bookings", r -> r
                        .path("/api/bookings/**")
                        .filters(f -> f.filter(jwtFilter.apply(new JwtAuthenticationFilter.Config())))
                        .uri("lb://rental-service"))
                
                .build();
    }
}
