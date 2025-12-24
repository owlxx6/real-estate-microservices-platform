package com.realestate.rental.dto;

import com.realestate.rental.model.Booking;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long id;
    private Long rentalPropertyId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numberOfGuests;
    private BigDecimal totalPrice;
    private String status;
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private String specialRequests;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Informations supplémentaires du bien louable
    private BigDecimal pricePerNight;
    private BigDecimal cleaningFee;
    private String propertyTitle;
    private String propertyCity;
    
    public static BookingDTO fromEntity(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setRentalPropertyId(booking.getRentalPropertyId());
        dto.setStartDate(booking.getStartDate());
        dto.setEndDate(booking.getEndDate());
        dto.setNumberOfGuests(booking.getNumberOfGuests());
        dto.setTotalPrice(booking.getTotalPrice());
        dto.setStatus(booking.getStatus().name());
        dto.setGuestName(booking.getGuestName());
        dto.setGuestEmail(booking.getGuestEmail());
        dto.setGuestPhone(booking.getGuestPhone());
        dto.setSpecialRequests(booking.getSpecialRequests());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}

