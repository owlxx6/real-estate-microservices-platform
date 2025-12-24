package com.realestate.property.service;

import com.realestate.property.dto.PropertyDTO;
import com.realestate.property.model.Property;
import com.realestate.property.model.Property.*;
import com.realestate.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PropertyService {
    
    private final PropertyRepository propertyRepository;
    
    public Page<PropertyDTO> getAllProperties(Pageable pageable) {
        return propertyRepository.findAll(pageable).map(PropertyDTO::fromEntity);
    }
    
    public PropertyDTO getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        return PropertyDTO.fromEntity(property);
    }
    
    public PropertyDTO createProperty(Property property) {
        Property saved = propertyRepository.save(property);
        log.info("Property created with id: {}", saved.getId());
        return PropertyDTO.fromEntity(saved);
    }
    
    public PropertyDTO updateProperty(Long id, Property propertyDetails) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));
        
        property.setTitle(propertyDetails.getTitle());
        property.setDescription(propertyDetails.getDescription());
        property.setType(propertyDetails.getType());
        property.setTransactionType(propertyDetails.getTransactionType());
        property.setPrice(propertyDetails.getPrice());
        property.setMonthlyRent(propertyDetails.getMonthlyRent());
        property.setDepositAmount(propertyDetails.getDepositAmount());
        property.setRentalDuration(propertyDetails.getRentalDuration());
        property.setSurface(propertyDetails.getSurface());
        property.setRooms(propertyDetails.getRooms());
        property.setBathrooms(propertyDetails.getBathrooms());
        property.setAddress(propertyDetails.getAddress());
        property.setCity(propertyDetails.getCity());
        property.setPostalCode(propertyDetails.getPostalCode());
        property.setStatus(propertyDetails.getStatus());
        property.setAgentId(propertyDetails.getAgentId());
        property.setHasParking(propertyDetails.getHasParking());
        property.setHasGarden(propertyDetails.getHasGarden());
        property.setHasPool(propertyDetails.getHasPool());
        property.setHasElevator(propertyDetails.getHasElevator());
        property.setFloorNumber(propertyDetails.getFloorNumber());
        property.setTotalFloors(propertyDetails.getTotalFloors());
        property.setYearBuilt(propertyDetails.getYearBuilt());
        
        Property updated = propertyRepository.save(property);
        log.info("Property updated with id: {}", updated.getId());
        return PropertyDTO.fromEntity(updated);
    }
    
    public void deleteProperty(Long id) {
        propertyRepository.deleteById(id);
        log.info("Property deleted with id: {}", id);
    }
    
    public Page<PropertyDTO> searchProperties(
            String city,
            PropertyType type,
            TransactionType transactionType,
            PropertyStatus status,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer minRooms,
            Pageable pageable) {
        
        Specification<Property> spec = Specification.where(null);
        
        if (city != null && !city.isEmpty()) {
            spec = spec.and((root, query, cb) -> 
                cb.like(cb.lower(root.get("city")), "%" + city.toLowerCase() + "%"));
        }
        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type));
        }
        if (transactionType != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("transactionType"), transactionType));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (minPrice != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), minPrice));
        }
        if (maxPrice != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), maxPrice));
        }
        if (minRooms != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("rooms"), minRooms));
        }
        
        return propertyRepository.findAll(spec, pageable).map(PropertyDTO::fromEntity);
    }
    
    public Page<PropertyDTO> getPropertiesByAgent(Long agentId, Pageable pageable) {
        return propertyRepository.findByAgentId(agentId, pageable).map(PropertyDTO::fromEntity);
    }
    
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        long total = propertyRepository.count();
        long available = propertyRepository.countByStatus(PropertyStatus.AVAILABLE);
        long forSale = propertyRepository.countByTransactionType(TransactionType.SALE);
        long forRent = propertyRepository.countByTransactionType(TransactionType.RENTAL);
        
        BigDecimal avgPrice = propertyRepository.findAveragePrice(PropertyStatus.AVAILABLE);
        
        Map<String, Long> byType = new HashMap<>();
        propertyRepository.countByType().forEach(obj -> 
            byType.put(obj[0].toString(), ((Number) obj[1]).longValue()));
        
        Map<String, Long> byCity = new HashMap<>();
        propertyRepository.countByCity().forEach(obj -> 
            byCity.put((String) obj[0], ((Number) obj[1]).longValue()));
        
        Map<String, Long> byTransactionType = new HashMap<>();
        propertyRepository.countByTransactionType().forEach(obj ->
            byTransactionType.put(obj[0].toString(), ((Number) obj[1]).longValue()));
        
        stats.put("totalProperties", total);
        stats.put("availableProperties", available);
        stats.put("propertiesForSale", forSale);
        stats.put("propertiesForRent", forRent);
        stats.put("averagePrice", avgPrice != null ? avgPrice : BigDecimal.ZERO);
        stats.put("propertiesByType", byType);
        stats.put("propertiesByCity", byCity);
        stats.put("propertiesByTransactionType", byTransactionType);
        
        return stats;
    }
}

