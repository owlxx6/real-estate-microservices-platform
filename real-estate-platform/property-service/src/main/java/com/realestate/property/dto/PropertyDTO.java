package com.realestate.property.dto;

import com.realestate.property.model.Property;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDTO {
    private Long id;
    private String title;
    private String description;
    private String type;
    private String transactionType;
    private BigDecimal price;
    private BigDecimal monthlyRent;
    private BigDecimal depositAmount;
    private Integer rentalDuration;
    private Integer surface;
    private Integer rooms;
    private Integer bathrooms;
    private String address;
    private String city;
    private String postalCode;
    private String status;
    private Long agentId;
    private Boolean hasParking;
    private Boolean hasGarden;
    private Boolean hasPool;
    private Boolean hasElevator;
    private Integer floorNumber;
    private Integer totalFloors;
    private Integer yearBuilt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static PropertyDTO fromEntity(Property property) {
        PropertyDTO dto = new PropertyDTO();
        dto.setId(property.getId());
        dto.setTitle(property.getTitle());
        dto.setDescription(property.getDescription());
        dto.setType(property.getType() != null ? property.getType().name() : null);
        dto.setTransactionType(property.getTransactionType() != null ? property.getTransactionType().name() : null);
        dto.setPrice(property.getPrice());
        dto.setMonthlyRent(property.getMonthlyRent());
        dto.setDepositAmount(property.getDepositAmount());
        dto.setRentalDuration(property.getRentalDuration());
        dto.setSurface(property.getSurface());
        dto.setRooms(property.getRooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setAddress(property.getAddress());
        dto.setCity(property.getCity());
        dto.setPostalCode(property.getPostalCode());
        dto.setStatus(property.getStatus() != null ? property.getStatus().name() : null);
        dto.setAgentId(property.getAgentId());
        dto.setHasParking(property.getHasParking());
        dto.setHasGarden(property.getHasGarden());
        dto.setHasPool(property.getHasPool());
        dto.setHasElevator(property.getHasElevator());
        dto.setFloorNumber(property.getFloorNumber());
        dto.setTotalFloors(property.getTotalFloors());
        dto.setYearBuilt(property.getYearBuilt());
        dto.setCreatedAt(property.getCreatedAt());
        dto.setUpdatedAt(property.getUpdatedAt());
        return dto;
    }
}

