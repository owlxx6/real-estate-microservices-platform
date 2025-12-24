package com.realestate.property.service;

import com.realestate.property.dto.SalePropertyDTO;
import com.realestate.property.model.Property;
import com.realestate.property.model.SaleProperty;
import com.realestate.property.model.SaleProperty.SaleStatus;
import com.realestate.property.repository.PropertyRepository;
import com.realestate.property.repository.SalePropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalePropertyService {
    
    private final SalePropertyRepository salePropertyRepository;
    private final PropertyRepository propertyRepository;
    
    @Transactional
    public SalePropertyDTO createSaleProperty(SaleProperty saleProperty) {
        log.info("Creating sale property for property ID: {}", saleProperty.getPropertyId());
        
        // Vérifier que la propriété existe
        Property property = propertyRepository.findById(saleProperty.getPropertyId())
            .orElseThrow(() -> new RuntimeException("Property not found with ID: " + saleProperty.getPropertyId()));
        
        // Vérifier si la propriété n'est pas déjà à vendre
        if (salePropertyRepository.existsByPropertyId(saleProperty.getPropertyId())) {
            throw new RuntimeException("Property is already listed for sale");
        }
        
        SaleProperty saved = salePropertyRepository.save(saleProperty);
        log.info("Sale property created with ID: {}", saved.getId());
        
        return enrichWithPropertyDetails(SalePropertyDTO.fromEntity(saved), property);
    }
    
    @Transactional
    public SalePropertyDTO updateSaleProperty(Long id, SaleProperty salePropertyDetails) {
        log.info("Updating sale property ID: {}", id);
        
        SaleProperty saleProperty = salePropertyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Sale property not found with ID: " + id));
        
        Property property = propertyRepository.findById(saleProperty.getPropertyId())
            .orElseThrow(() -> new RuntimeException("Property not found"));
        
        saleProperty.setSalePrice(salePropertyDetails.getSalePrice());
        saleProperty.setSaleStatus(salePropertyDetails.getSaleStatus());
        saleProperty.setIsActive(salePropertyDetails.getIsActive());
        
        SaleProperty updated = salePropertyRepository.save(saleProperty);
        log.info("Sale property updated: {}", updated.getId());
        
        return enrichWithPropertyDetails(SalePropertyDTO.fromEntity(updated), property);
    }
    
    @Transactional
    public SalePropertyDTO reserveSaleProperty(Long id) {
        log.info("Reserving sale property ID: {}", id);
        
        SaleProperty saleProperty = salePropertyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Sale property not found with ID: " + id));
        
        if (saleProperty.getSaleStatus() != SaleStatus.FOR_SALE) {
            throw new RuntimeException("Only properties FOR_SALE can be reserved");
        }
        
        Property property = propertyRepository.findById(saleProperty.getPropertyId())
            .orElseThrow(() -> new RuntimeException("Property not found"));
        
        saleProperty.setSaleStatus(SaleStatus.RESERVED);
        SaleProperty updated = salePropertyRepository.save(saleProperty);
        
        log.info("Sale property reserved: {}", id);
        return enrichWithPropertyDetails(SalePropertyDTO.fromEntity(updated), property);
    }
    
    @Transactional
    public SalePropertyDTO sellProperty(Long id, BigDecimal finalPrice) {
        log.info("Marking sale property ID: {} as sold", id);
        
        SaleProperty saleProperty = salePropertyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Sale property not found with ID: " + id));
        
        Property property = propertyRepository.findById(saleProperty.getPropertyId())
            .orElseThrow(() -> new RuntimeException("Property not found"));
        
        saleProperty.setSaleStatus(SaleStatus.SOLD);
        saleProperty.setSoldAt(LocalDateTime.now());
        saleProperty.setSoldPrice(finalPrice != null ? finalPrice : saleProperty.getSalePrice());
        saleProperty.setIsActive(false);  // Désactiver une fois vendu
        
        SaleProperty updated = salePropertyRepository.save(saleProperty);
        
        log.info("Sale property marked as sold: {}", id);
        return enrichWithPropertyDetails(SalePropertyDTO.fromEntity(updated), property);
    }
    
    @Transactional
    public void deactivateSaleProperty(Long id) {
        log.info("Deactivating sale property ID: {}", id);
        
        SaleProperty saleProperty = salePropertyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Sale property not found with ID: " + id));
        
        saleProperty.setIsActive(false);
        salePropertyRepository.save(saleProperty);
        
        log.info("Sale property deactivated: {}", id);
    }
    
    public SalePropertyDTO getSalePropertyById(Long id) {
        SaleProperty saleProperty = salePropertyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Sale property not found with ID: " + id));
        
        Property property = propertyRepository.findById(saleProperty.getPropertyId())
            .orElseThrow(() -> new RuntimeException("Property not found"));
        
        return enrichWithPropertyDetails(SalePropertyDTO.fromEntity(saleProperty), property);
    }
    
    public SalePropertyDTO getSalePropertyByPropertyId(Long propertyId) {
        SaleProperty saleProperty = salePropertyRepository.findByPropertyId(propertyId)
            .orElseThrow(() -> new RuntimeException("No sale property found for property ID: " + propertyId));
        
        Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new RuntimeException("Property not found"));
        
        return enrichWithPropertyDetails(SalePropertyDTO.fromEntity(saleProperty), property);
    }
    
    public List<SalePropertyDTO> getAllForSale() {
        List<SaleProperty> sales = salePropertyRepository.findByIsActiveTrueAndSaleStatus(SaleStatus.FOR_SALE);
        return sales.stream()
            .map(sp -> {
                Property property = propertyRepository.findById(sp.getPropertyId()).orElse(null);
                return enrichWithPropertyDetails(SalePropertyDTO.fromEntity(sp), property);
            })
            .collect(Collectors.toList());
    }
    
    public List<SalePropertyDTO> searchForSale(String city, String type, BigDecimal minPrice, BigDecimal maxPrice, Integer minRooms) {
        log.info("Searching properties for sale with filters");
        
        // Rechercher les SaleProperties selon le prix
        List<SaleProperty> saleProperties = salePropertyRepository.searchByPrice(minPrice, maxPrice);
        
        // Enrichir avec les détails de Property et filtrer
        return saleProperties.stream()
            .map(sp -> {
                Property property = propertyRepository.findById(sp.getPropertyId()).orElse(null);
                if (property == null) return null;
                
                // Filtrer par city, type, rooms
                if (city != null && !city.isEmpty() && !property.getCity().toLowerCase().contains(city.toLowerCase())) {
                    return null;
                }
                if (type != null && !type.isEmpty() && !property.getType().name().equals(type)) {
                    return null;
                }
                if (minRooms != null && property.getRooms() < minRooms) {
                    return null;
                }
                
                return enrichWithPropertyDetails(SalePropertyDTO.fromEntity(sp), property);
            })
            .filter(dto -> dto != null)
            .collect(Collectors.toList());
    }
    
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        long forSaleCount = salePropertyRepository.countByIsActiveTrueAndSaleStatus(SaleStatus.FOR_SALE);
        long reservedCount = salePropertyRepository.countBySaleStatus(SaleStatus.RESERVED);
        long soldCount = salePropertyRepository.countBySaleStatus(SaleStatus.SOLD);
        BigDecimal totalSales = salePropertyRepository.getTotalSalesAmount();
        BigDecimal avgPrice = salePropertyRepository.getAverageSalePrice();
        
        stats.put("forSale", forSaleCount);
        stats.put("reserved", reservedCount);
        stats.put("sold", soldCount);
        stats.put("totalSalesAmount", totalSales);
        stats.put("averagePrice", avgPrice);
        
        return stats;
    }
    
    // Méthode pour enrichir le DTO avec les détails de la propriété
    private SalePropertyDTO enrichWithPropertyDetails(SalePropertyDTO dto, Property property) {
        if (property != null) {
            dto.setTitle(property.getTitle());
            dto.setDescription(property.getDescription());
            dto.setType(property.getType() != null ? property.getType().name() : null);
            dto.setSurface(property.getSurface());
            dto.setRooms(property.getRooms());
            dto.setBathrooms(property.getBathrooms());
            dto.setAddress(property.getAddress());
            dto.setCity(property.getCity());
            dto.setPostalCode(property.getPostalCode());
            dto.setAgentId(property.getAgentId());
            dto.setHasParking(property.getHasParking());
            dto.setHasGarden(property.getHasGarden());
            dto.setHasPool(property.getHasPool());
            dto.setHasElevator(property.getHasElevator());
            dto.setFloorNumber(property.getFloorNumber());
            dto.setTotalFloors(property.getTotalFloors());
            dto.setYearBuilt(property.getYearBuilt());
        }
        return dto;
    }
}

