package com.realestate.rental.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_properties", indexes = {
    @Index(name = "idx_property_id", columnList = "property_id"),
    @Index(name = "idx_is_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RentalProperty {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Property ID is required")
    @Column(name = "property_id", nullable = false)
    private Long propertyId;
    
    @NotNull(message = "Price per night is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(name = "price_per_night", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;
    
    @DecimalMin(value = "0.0", message = "Cleaning fee must be positive")
    @Column(name = "cleaning_fee", precision = 10, scale = 2)
    private BigDecimal cleaningFee = BigDecimal.ZERO;
    
    @NotNull(message = "Max guests is required")
    @Min(value = 1, message = "Must accommodate at least 1 guest")
    @Column(name = "max_guests", nullable = false)
    private Integer maxGuests;
    
    @Column(name = "rules", columnDefinition = "TEXT")
    private String rules;
    
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Check-in time must be in HH:MM format")
    @Column(name = "check_in_time", length = 5)
    private String checkInTime = "15:00";
    
    @Pattern(regexp = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Check-out time must be in HH:MM format")
    @Column(name = "check_out_time", length = 5)
    private String checkOutTime = "11:00";
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

