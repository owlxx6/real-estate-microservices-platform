package com.realestate.property.service;

import com.realestate.property.dto.PropertyDTO;
import com.realestate.property.dto.PropertyStatisticsDTO;
import com.realestate.property.model.Property;
import com.realestate.property.model.PropertyStatus;
import com.realestate.property.model.PropertyType;
import com.realestate.property.repository.PropertyRepository;
import com.realestate.property.repository.PropertySpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PropertyService {
    
    private final PropertyRepository propertyRepository;
    
    // Custom configuration property from Config Server
    @Value("${mes-config-ms.properties-last:10}")
    private Integer propertiesLastDays;
    
    @Value("${mes-config-ms.properties-page-size:20}")
    private Integer defaultPageSize;
    
    public PropertyDTO createProperty(Property property) {
        log.info("Creating new property: {}", property.getTitle());
        Property savedProperty = propertyRepository.save(property);
        return mapToDTO(savedProperty);
    }
    
    public PropertyDTO getPropertyById(Long id) {
        log.info("Fetching property with id: {}", id);
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        return mapToDTO(property);
    }
    
    public Page<PropertyDTO> getAllProperties(Pageable pageable) {
        log.info("Fetching all properties with pagination");
        return propertyRepository.findAll(pageable).map(this::mapToDTO);
    }
    
    public PropertyDTO updateProperty(Long id, Property propertyDetails) {
        log.info("Updating property with id: {}", id);
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        
        property.setTitle(propertyDetails.getTitle());
        property.setDescription(propertyDetails.getDescription());
        property.setType(propertyDetails.getType());
        property.setPrice(propertyDetails.getPrice());
        property.setSurface(propertyDetails.getSurface());
        property.setRooms(propertyDetails.getRooms());
        property.setBathrooms(propertyDetails.getBathrooms());
        property.setAddress(propertyDetails.getAddress());
        property.setCity(propertyDetails.getCity());
        property.setStatus(propertyDetails.getStatus());
        property.setAgentId(propertyDetails.getAgentId());
        
        Property updatedProperty = propertyRepository.save(property);
        return mapToDTO(updatedProperty);
    }
    
    public void deleteProperty(Long id) {
        log.info("Deleting property with id: {}", id);
        if (!propertyRepository.existsById(id)) {
            throw new RuntimeException("Property not found with id: " + id);
        }
        propertyRepository.deleteById(id);
    }
    
    public Page<PropertyDTO> searchProperties(
            String city,
            PropertyType type,
            PropertyStatus status,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minRooms,
            Integer maxRooms,
            Integer minSurface,
            Integer maxSurface,
            Pageable pageable) {
        
        log.info("Searching properties with filters - city: {}, type: {}, status: {}", city, type, status);
        
        return propertyRepository.findAll(
            PropertySpecification.filterProperties(
                city, type, status, minPrice, maxPrice, 
                minRooms, maxRooms, minSurface, maxSurface
            ),
            pageable
        ).map(this::mapToDTO);
    }
    
    public List<PropertyDTO> getPropertiesByAgent(Long agentId) {
        log.info("Fetching properties for agent: {}", agentId);
        return propertyRepository.findByAgentId(agentId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    /**
     * Get property statistics using custom configuration property
     * Uses mes-config-ms.properties-last to determine recent properties
     */
    public PropertyStatisticsDTO getPropertyStatistics() {
        log.info("Calculating property statistics (recent properties from last {} days)", propertiesLastDays);
        
        PropertyStatisticsDTO statistics = new PropertyStatisticsDTO();
        
        // Total counts by status
        statistics.setTotalProperties(propertyRepository.count());
        statistics.setAvailableProperties(propertyRepository.countByStatus(PropertyStatus.AVAILABLE));
        statistics.setReservedProperties(propertyRepository.countByStatus(PropertyStatus.RESERVED));
        statistics.setSoldProperties(propertyRepository.countByStatus(PropertyStatus.SOLD));
        
        // Price statistics
        List<Property> allProperties = propertyRepository.findAll();
        if (!allProperties.isEmpty()) {
            BigDecimal avgPrice = allProperties.stream()
                    .map(Property::getPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(allProperties.size()), 2, RoundingMode.HALF_UP);
            
            statistics.setAveragePrice(avgPrice);
            statistics.setMinPrice(allProperties.stream()
                    .map(Property::getPrice)
                    .min(BigDecimal::compareTo)
                    .orElse(BigDecimal.ZERO));
            statistics.setMaxPrice(allProperties.stream()
                    .map(Property::getPrice)
                    .max(BigDecimal::compareTo)
                    .orElse(BigDecimal.ZERO));
        }
        
        // Properties by type
        Map<String, Long> byType = new HashMap<>();
        for (PropertyType type : PropertyType.values()) {
            byType.put(type.name(), propertyRepository.countByType(type));
        }
        statistics.setPropertiesByType(byType);
        
        // Properties by city
        Map<String, Long> byCity = new HashMap<>();
        List<Object[]> cityCounts = propertyRepository.countByCity();
        for (Object[] cityCount : cityCounts) {
            byCity.put((String) cityCount[0], (Long) cityCount[1]);
        }
        statistics.setPropertiesByCity(byCity);
        
        // Recent properties using custom configuration
        LocalDateTime sinceDate = LocalDateTime.now().minusDays(propertiesLastDays);
        List<Property> recentProperties = propertyRepository.findRecentProperties(sinceDate);
        statistics.setRecentPropertiesCount((long) recentProperties.size());
        
        log.info("Statistics calculated: {} total properties, {} recent (last {} days)", 
                statistics.getTotalProperties(), statistics.getRecentPropertiesCount(), propertiesLastDays);
        
        return statistics;
    }
    
    private PropertyDTO mapToDTO(Property property) {
        PropertyDTO dto = new PropertyDTO();
        dto.setId(property.getId());
        dto.setTitle(property.getTitle());
        dto.setDescription(property.getDescription());
        dto.setType(property.getType());
        dto.setPrice(property.getPrice());
        dto.setSurface(property.getSurface());
        dto.setRooms(property.getRooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setAddress(property.getAddress());
        dto.setCity(property.getCity());
        dto.setStatus(property.getStatus());
        dto.setAgentId(property.getAgentId());
        dto.setCreatedAt(property.getCreatedAt());
        dto.setUpdatedAt(property.getUpdatedAt());
        return dto;
    }
}

