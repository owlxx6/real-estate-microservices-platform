package com.realestate.rental.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class CalendarDTO {
    private Long rentalPropertyId;
    private Integer year;
    private Integer month;
    private List<LocalDate> blockedDates;  // Dates réservées
    private Map<LocalDate, BookingInfo> bookings;  // Détails des réservations
    
    public CalendarDTO() {}
    
    public CalendarDTO(Long rentalPropertyId, Integer year, Integer month, 
                       List<LocalDate> blockedDates, Map<LocalDate, BookingInfo> bookings) {
        this.rentalPropertyId = rentalPropertyId;
        this.year = year;
        this.month = month;
        this.blockedDates = blockedDates;
        this.bookings = bookings;
    }
    
    @Data
    public static class BookingInfo {
        private Long bookingId;
        private String guestName;
        private LocalDate startDate;
        private LocalDate endDate;
        
        public BookingInfo() {}
        
        public BookingInfo(Long bookingId, String guestName, LocalDate startDate, LocalDate endDate) {
            this.bookingId = bookingId;
            this.guestName = guestName;
            this.startDate = startDate;
            this.endDate = endDate;
        }
    }
}

