package com.realestate.rental.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_rental_property", columnList = "rental_property_id"),
    @Index(name = "idx_dates", columnList = "start_date, end_date"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_guest_email", columnList = "guest_email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Rental property ID is required")
    @Column(name = "rental_property_id", nullable = false)
    private Long rentalPropertyId;
    
    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "Must have at least 1 guest")
    @Column(name = "number_of_guests", nullable = false)
    private Integer numberOfGuests;
    
    @NotNull(message = "Total price is required")
    @DecimalMin(value = "0.0", message = "Total price must be positive")
    @Column(name = "total_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;
    
    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BookingStatus status = BookingStatus.PENDING;
    
    @NotBlank(message = "Guest name is required")
    @Size(max = 100, message = "Guest name must not exceed 100 characters")
    @Column(name = "guest_name", nullable = false, length = 100)
    private String guestName;
    
    @NotBlank(message = "Guest email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Column(name = "guest_email", nullable = false, length = 100)
    private String guestEmail;
    
    @Pattern(regexp = "^\\+?[0-9]{10,20}$", message = "Invalid phone number format")
    @Column(name = "guest_phone", length = 20)
    private String guestPhone;
    
    @Column(name = "special_requests", columnDefinition = "TEXT")
    private String specialRequests;
    
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
    
    // Enum pour les statuts de réservation
    public enum BookingStatus {
        PENDING,     // En attente de confirmation
        CONFIRMED,   // Confirmée
        CANCELLED,   // Annulée
        COMPLETED    // Terminée
    }
}

