package com.realestate.interfaceapi.service;

import com.realestate.interfaceapi.dto.AgentDTO;
import com.realestate.interfaceapi.dto.PropertyDTO;
import com.realestate.interfaceapi.dto.PropertyWithAgentDTO;
import com.realestate.interfaceapi.feign.ClientServiceClient;
import com.realestate.interfaceapi.feign.PropertyServiceClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {
    
    private final PropertyServiceClient propertyServiceClient;
    private final ClientServiceClient clientServiceClient;
    
    /**
     * Search properties with agent information enrichment
     */
    @CircuitBreaker(name = "propertyService", fallbackMethod = "searchPropertiesWithAgentFallback")
    public List<PropertyWithAgentDTO> searchPropertiesWithAgent(
            String city,
            String type,
            String status,
            BigDecimal minPrice,
            BigDecimal maxPrice) {
        
        log.info("Searching properties with filters - city: {}, type: {}, status: {}", city, type, status);
        
        // Call property service to search
        Object searchResponse = propertyServiceClient.searchProperties(city, type, status, minPrice, maxPrice, 0, 20);
        
        List<PropertyWithAgentDTO> result = new ArrayList<>();
        
        // In a real scenario, parse the paginated response and enrich with agent data
        // For now, return empty list as placeholder
        
        log.info("Property search completed, found {} results", result.size());
        return result;
    }
    
    public List<PropertyWithAgentDTO> searchPropertiesWithAgentFallback(
            String city, String type, String status, BigDecimal minPrice, BigDecimal maxPrice, Exception e) {
        log.warn("Using fallback for property search: {}", e.getMessage());
        return new ArrayList<>();
    }
    
    /**
     * Get property with agent details
     */
    @CircuitBreaker(name = "propertyService", fallbackMethod = "getPropertyWithAgentFallback")
    public PropertyWithAgentDTO getPropertyWithAgent(Long propertyId) {
        log.info("Fetching property with agent details: {}", propertyId);
        
        PropertyDTO property = propertyServiceClient.getPropertyById(propertyId);
        AgentDTO agent = clientServiceClient.getAgentById(property.getAgentId());
        
        return new PropertyWithAgentDTO(property, agent);
    }
    
    public PropertyWithAgentDTO getPropertyWithAgentFallback(Long propertyId, Exception e) {
        log.warn("Using fallback for property with agent: {}", e.getMessage());
        return new PropertyWithAgentDTO();
    }
}

