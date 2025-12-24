package com.realestate.rental.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequestDTO {
    
    // Either rentalPropertyId or propertyId must be provided
    private Long rentalPropertyId;
    
    // If propertyId is provided and rentalPropertyId is null, RentalProperty will be created automatically
    private Long propertyId;
    
    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;
    
    @NotNull(message = "End date is required")
    private LocalDate endDate;
    
    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "Must have at least 1 guest")
    private Integer numberOfGuests;
    
    @NotBlank(message = "Guest name is required")
    @Size(max = 100, message = "Guest name must not exceed 100 characters")
    private String guestName;
    
    @NotBlank(message = "Guest email is required")
    @Email(message = "Invalid email format")
    private String guestEmail;
    
    @Pattern(regexp = "^$|^\\+?[0-9]{6,20}$", message = "Invalid phone number format (6-20 digits)")
    private String guestPhone; // Optional, but if provided must match pattern (6-20 digits)
    
    private String specialRequests;
}

