package com.realestate.interfaceapi.service;

import com.realestate.interfaceapi.dto.*;
import com.realestate.interfaceapi.feign.ClientServiceClient;
import com.realestate.interfaceapi.feign.PropertyServiceClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {
    
    private final PropertyServiceClient propertyServiceClient;
    private final ClientServiceClient clientServiceClient;
    
    @Value("${mes-config-ms.dashboard-refresh-interval:30}")
    private Integer dashboardRefreshInterval;
    
    @Value("${mes-config-ms.recent-activities-days:7}")
    private Integer recentActivitiesDays;
    
    /**
     * Get overall dashboard statistics with circuit breaker
     */
    @CircuitBreaker(name = "propertyService", fallbackMethod = "getDashboardStatisticsFallback")
    public DashboardStatisticsDTO getDashboardStatistics() {
        log.info("Fetching dashboard statistics (refresh interval: {} seconds)", dashboardRefreshInterval);
        
        DashboardStatisticsDTO statistics = new DashboardStatisticsDTO();
        
        try {
            // Get property statistics
            Map<String, Object> propertyStats = propertyServiceClient.getPropertyStatistics();
            statistics.setTotalProperties(getLongValue(propertyStats, "totalProperties"));
            statistics.setAvailableProperties(getLongValue(propertyStats, "availableProperties"));
            statistics.setAveragePrice(getBigDecimalValue(propertyStats, "averagePrice"));
            statistics.setPropertiesByType((Map<String, Long>) propertyStats.get("propertiesByType"));
            statistics.setPropertiesByCity((Map<String, Long>) propertyStats.get("propertiesByCity"));
        } catch (Exception e) {
            log.error("Error fetching property statistics: {}", e.getMessage());
        }
        
        try {
            // Get client statistics (simplified - count from list)
            Object clientsResponse = clientServiceClient.getAllClients();
            Object agentsResponse = clientServiceClient.getAllAgents();
            
            // In real scenario, you'd parse the paginated response
            statistics.setTotalClients(10L); // Placeholder
            statistics.setTotalAgents(5L); // Placeholder
        } catch (Exception e) {
            log.error("Error fetching client statistics: {}", e.getMessage());
        }
        
        try {
            // Get visit statistics
            List<VisitDTO> recentVisits = clientServiceClient.getRecentVisits();
            statistics.setRecentActivities((long) recentVisits.size());
            
            // Count visits by status
            long scheduled = recentVisits.stream()
                    .filter(v -> "SCHEDULED".equals(v.getStatus()))
                    .count();
            long completed = recentVisits.stream()
                    .filter(v -> "COMPLETED".equals(v.getStatus()))
                    .count();
            
            statistics.setTotalVisits((long) recentVisits.size());
            statistics.setScheduledVisits(scheduled);
            statistics.setCompletedVisits(completed);
        } catch (Exception e) {
            log.error("Error fetching visit statistics: {}", e.getMessage());
        }
        
        log.info("Dashboard statistics calculated successfully (recent activities from last {} days)", 
                recentActivitiesDays);
        return statistics;
    }
    
    /**
     * Fallback method for dashboard statistics
     */
    public DashboardStatisticsDTO getDashboardStatisticsFallback(Exception e) {
        log.warn("Using fallback for dashboard statistics due to: {}", e.getMessage());
        DashboardStatisticsDTO fallback = new DashboardStatisticsDTO();
        fallback.setTotalProperties(0L);
        fallback.setAvailableProperties(0L);
        fallback.setAveragePrice(BigDecimal.ZERO);
        fallback.setPropertiesByType(new HashMap<>());
        fallback.setPropertiesByCity(new HashMap<>());
        fallback.setTotalClients(0L);
        fallback.setTotalAgents(0L);
        fallback.setTotalVisits(0L);
        fallback.setScheduledVisits(0L);
        fallback.setCompletedVisits(0L);
        fallback.setRecentActivities(0L);
        return fallback;
    }
    
    /**
     * Get agent dashboard with properties and visits
     */
    @CircuitBreaker(name = "clientService", fallbackMethod = "getAgentDashboardFallback")
    public AgentDashboardDTO getAgentDashboard(Long agentId) {
        log.info("Fetching dashboard for agent: {}", agentId);
        
        AgentDTO agent = clientServiceClient.getAgentById(agentId);
        Object propertiesResponse = propertyServiceClient.getPropertiesByAgent(agentId);
        
        // Parse properties (simplified)
        List<PropertyDTO> properties = new ArrayList<>();
        
        AgentDashboardDTO dashboard = new AgentDashboardDTO();
        dashboard.setAgent(agent);
        dashboard.setProperties(properties);
        dashboard.setPropertyCount(properties.size());
        dashboard.setUpcomingVisits(new ArrayList<>());
        
        return dashboard;
    }
    
    public AgentDashboardDTO getAgentDashboardFallback(Long agentId, Exception e) {
        log.warn("Using fallback for agent dashboard: {}", e.getMessage());
        AgentDashboardDTO fallback = new AgentDashboardDTO();
        fallback.setProperties(new ArrayList<>());
        fallback.setPropertyCount(0);
        fallback.setUpcomingVisits(new ArrayList<>());
        return fallback;
    }
    
    /**
     * Get client dashboard with visits and properties
     */
    @CircuitBreaker(name = "clientService", fallbackMethod = "getClientDashboardFallback")
    public ClientDashboardDTO getClientDashboard(Long clientId) {
        log.info("Fetching dashboard for client: {}", clientId);
        
        ClientDTO client = clientServiceClient.getClientById(clientId);
        List<VisitDTO> visits = clientServiceClient.getVisitsByClient(clientId);
        
        // Get properties for visits
        List<PropertyWithAgentDTO> visitedProperties = new ArrayList<>();
        for (VisitDTO visit : visits) {
            try {
                PropertyDTO property = propertyServiceClient.getPropertyById(visit.getPropertyId());
                AgentDTO agent = clientServiceClient.getAgentById(property.getAgentId());
                visitedProperties.add(new PropertyWithAgentDTO(property, agent));
            } catch (Exception e) {
                log.error("Error fetching property or agent for visit: {}", e.getMessage());
            }
        }
        
        ClientDashboardDTO dashboard = new ClientDashboardDTO();
        dashboard.setClient(client);
        dashboard.setVisits(visits);
        dashboard.setVisitedProperties(visitedProperties);
        
        return dashboard;
    }
    
    public ClientDashboardDTO getClientDashboardFallback(Long clientId, Exception e) {
        log.warn("Using fallback for client dashboard: {}", e.getMessage());
        ClientDashboardDTO fallback = new ClientDashboardDTO();
        fallback.setVisits(new ArrayList<>());
        fallback.setVisitedProperties(new ArrayList<>());
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

