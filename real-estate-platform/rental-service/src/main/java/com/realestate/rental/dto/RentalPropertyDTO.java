package com.realestate.rental.dto;

import com.realestate.rental.model.RentalProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalPropertyDTO {
    private Long id;
    private Long propertyId;
    private BigDecimal pricePerNight;
    private BigDecimal cleaningFee;
    private Integer maxGuests;
    private String rules;
    private String checkInTime;
    private String checkOutTime;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Informations de la propriété (récupérées via Feign)
    private String propertyTitle;
    private String propertyCity;
    private String propertyType;
    private Integer propertyRooms;
    private Integer propertyBathrooms;
    private Integer propertySurface;
    private String propertyAddress;
    
    public static RentalPropertyDTO fromEntity(RentalProperty rentalProperty) {
        RentalPropertyDTO dto = new RentalPropertyDTO();
        dto.setId(rentalProperty.getId());
        dto.setPropertyId(rentalProperty.getPropertyId());
        dto.setPricePerNight(rentalProperty.getPricePerNight());
        dto.setCleaningFee(rentalProperty.getCleaningFee());
        dto.setMaxGuests(rentalProperty.getMaxGuests());
        dto.setRules(rentalProperty.getRules());
        dto.setCheckInTime(rentalProperty.getCheckInTime());
        dto.setCheckOutTime(rentalProperty.getCheckOutTime());
        dto.setIsActive(rentalProperty.getIsActive());
        dto.setCreatedAt(rentalProperty.getCreatedAt());
        dto.setUpdatedAt(rentalProperty.getUpdatedAt());
        return dto;
    }
}

