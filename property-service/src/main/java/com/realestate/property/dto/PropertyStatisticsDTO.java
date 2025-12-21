package com.realestate.property.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyStatisticsDTO {
    private Long totalProperties;
    private Long availableProperties;
    private Long reservedProperties;
    private Long soldProperties;
    private BigDecimal averagePrice;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Map<String, Long> propertiesByType;
    private Map<String, Long> propertiesByCity;
    private Long recentPropertiesCount; // Based on mes-config-ms.properties-last
}

