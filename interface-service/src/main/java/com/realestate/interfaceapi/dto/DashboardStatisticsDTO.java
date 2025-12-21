package com.realestate.interfaceapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatisticsDTO {
    // Property statistics
    private Long totalProperties;
    private Long availableProperties;
    private BigDecimal averagePrice;
    private Map<String, Long> propertiesByType;
    private Map<String, Long> propertiesByCity;
    
    // Client statistics
    private Long totalClients;
    private Long totalAgents;
    
    // Visit statistics
    private Long totalVisits;
    private Long scheduledVisits;
    private Long completedVisits;
    private Long recentActivities;
}

