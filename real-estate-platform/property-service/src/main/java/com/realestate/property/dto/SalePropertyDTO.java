package com.realestate.property.dto;

import com.realestate.property.model.SaleProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalePropertyDTO {
    private Long id;
    private Long propertyId;
    private BigDecimal salePrice;
    private String saleStatus;
    private LocalDateTime soldAt;
    private BigDecimal soldPrice;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Informations du bien immobilier (via Property)
    private String title;
    private String description;
    private String type;
    private Integer surface;
    private Integer rooms;
    private Integer bathrooms;
    private String address;
    private String city;
    private String postalCode;
    private Long agentId;
    private Boolean hasParking;
    private Boolean hasGarden;
    private Boolean hasPool;
    private Boolean hasElevator;
    private Integer floorNumber;
    private Integer totalFloors;
    private Integer yearBuilt;
    
    public static SalePropertyDTO fromEntity(SaleProperty saleProperty) {
        SalePropertyDTO dto = new SalePropertyDTO();
        dto.setId(saleProperty.getId());
        dto.setPropertyId(saleProperty.getPropertyId());
        dto.setSalePrice(saleProperty.getSalePrice());
        dto.setSaleStatus(saleProperty.getSaleStatus() != null ? saleProperty.getSaleStatus().name() : null);
        dto.setSoldAt(saleProperty.getSoldAt());
        dto.setSoldPrice(saleProperty.getSoldPrice());
        dto.setIsActive(saleProperty.getIsActive());
        dto.setCreatedAt(saleProperty.getCreatedAt());
        dto.setUpdatedAt(saleProperty.getUpdatedAt());
        return dto;
    }
}

