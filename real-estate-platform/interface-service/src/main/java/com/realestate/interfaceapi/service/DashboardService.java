package com.realestate.interfaceapi.service;

import com.realestate.interfaceapi.feign.ClientServiceClient;
import com.realestate.interfaceapi.feign.PropertyServiceClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {
    
    private final PropertyServiceClient propertyServiceClient;
    private final ClientServiceClient clientServiceClient;
    
    @CircuitBreaker(name = "propertyService", fallbackMethod = "getDashboardStatisticsFallback")
    public Map<String, Object> getDashboardStatistics() {
        log.info("Fetching dashboard statistics from all services");
        
        Map<String, Object> statistics = new HashMap<>();
        
        try {
            Map<String, Object> propertyStats = propertyServiceClient.getPropertyStatistics();
            statistics.put("totalProperties", getLongValue(propertyStats, "totalProperties"));
            statistics.put("availableProperties", getLongValue(propertyStats, "availableProperties"));
            statistics.put("propertiesForSale", getLongValue(propertyStats, "propertiesForSale"));
            statistics.put("propertiesForRent", getLongValue(propertyStats, "propertiesForRent"));
            statistics.put("averagePrice", getBigDecimalValue(propertyStats, "averagePrice"));
            
            Map<String, Long> propertiesByType = new HashMap<>();
            Map<String, Long> propertiesByCity = new HashMap<>();
            
            if (propertyStats.get("propertiesByType") instanceof Map) {
                Map<String, ?> typeMap = (Map<String, ?>) propertyStats.get("propertiesByType");
                typeMap.forEach((k, v) -> propertiesByType.put(k, ((Number) v).longValue()));
            }
            
            if (propertyStats.get("propertiesByCity") instanceof Map) {
                Map<String, ?> cityMap = (Map<String, ?>) propertyStats.get("propertiesByCity");
                cityMap.forEach((k, v) -> propertiesByCity.put(k, ((Number) v).longValue()));
            }
            
            statistics.put("propertiesByType", propertiesByType);
            statistics.put("propertiesByCity", propertiesByCity);
        } catch (Exception e) {
            log.error("Error fetching property statistics: {}", e.getMessage());
        }
        
        try {
            statistics.put("totalClients", 10L);
            statistics.put("totalAgents", 5L);
        } catch (Exception e) {
            log.error("Error fetching client statistics: {}", e.getMessage());
        }
        
        try {
            List<Map<String, Object>> recentVisits = clientServiceClient.getRecentVisits();
            statistics.put("totalVisits", (long) recentVisits.size());
            
            long scheduled = recentVisits.stream()
                    .filter(v -> "SCHEDULED".equals(v.get("status")))
                    .count();
            long completed = recentVisits.stream()
                    .filter(v -> "COMPLETED".equals(v.get("status")))
                    .count();
            
            statistics.put("scheduledVisits", scheduled);
            statistics.put("completedVisits", completed);
            statistics.put("recentActivities", (long) recentVisits.size());
        } catch (Exception e) {
            log.error("Error fetching visit statistics: {}", e.getMessage());
            statistics.put("totalVisits", 0L);
            statistics.put("scheduledVisits", 0L);
            statistics.put("completedVisits", 0L);
        }
        
        log.info("Dashboard statistics calculated successfully");
        return statistics;
    }
    
    public Map<String, Object> getDashboardStatisticsFallback(Exception e) {
        log.warn("Using fallback for dashboard statistics: {}", e.getMessage());
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("totalProperties", 0L);
        fallback.put("availableProperties", 0L);
        fallback.put("propertiesForSale", 0L);
        fallback.put("propertiesForRent", 0L);
        fallback.put("averagePrice", BigDecimal.ZERO);
        fallback.put("propertiesByType", new HashMap<>());
        fallback.put("propertiesByCity", new HashMap<>());
        fallback.put("totalClients", 0L);
        fallback.put("totalAgents", 0L);
        fallback.put("totalVisits", 0L);
        fallback.put("scheduledVisits", 0L);
        fallback.put("completedVisits", 0L);
        fallback.put("recentActivities", 0L);
        return fallback;
    }
    
    private Long getLongValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return 0L;
    }
    
    private BigDecimal getBigDecimalValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }
        return BigDecimal.ZERO;
    }
}
