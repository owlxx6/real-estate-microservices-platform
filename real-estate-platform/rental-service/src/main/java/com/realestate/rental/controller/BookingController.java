package com.realestate.rental.controller;

import com.realestate.rental.dto.BookingDTO;
import com.realestate.rental.dto.BookingRequestDTO;
import com.realestate.rental.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Booking management APIs")
public class BookingController {
    
    private final BookingService bookingService;
    
    @GetMapping
    @Operation(summary = "Get all bookings")
    public ResponseEntity<List<BookingDTO>> getAllBookings() {
        List<BookingDTO> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        BookingDTO booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(booking);
    }
    
    @PostMapping
    @Operation(summary = "Create a new booking")
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody BookingRequestDTO request) {
        BookingDTO created = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}/confirm")
    @Operation(summary = "Confirm a pending booking")
    public ResponseEntity<BookingDTO> confirmBooking(@PathVariable Long id) {
        BookingDTO confirmed = bookingService.confirmBooking(id);
        return ResponseEntity.ok(confirmed);
    }
    
    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable Long id) {
        BookingDTO cancelled = bookingService.cancelBooking(id);
        return ResponseEntity.ok(cancelled);
    }
    
    @PutMapping("/{id}/complete")
    @Operation(summary = "Mark booking as completed")
    public ResponseEntity<BookingDTO> completeBooking(@PathVariable Long id) {
        BookingDTO completed = bookingService.completeBooking(id);
        return ResponseEntity.ok(completed);
    }
    
    @GetMapping("/rental/{rentalId}")
    @Operation(summary = "Get bookings for a rental property")
    public ResponseEntity<List<BookingDTO>> getBookingsByRentalProperty(@PathVariable Long rentalId) {
        List<BookingDTO> bookings = bookingService.getBookingsByRentalProperty(rentalId);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/guest/{email}")
    @Operation(summary = "Get bookings by guest email")
    public ResponseEntity<List<BookingDTO>> getBookingsByGuestEmail(@PathVariable String email) {
        List<BookingDTO> bookings = bookingService.getBookingsByGuestEmail(email);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get bookings by status")
    public ResponseEntity<List<BookingDTO>> getBookingsByStatus(@PathVariable String status) {
        List<BookingDTO> bookings = bookingService.getBookingsByStatus(status);
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming confirmed bookings")
    public ResponseEntity<List<BookingDTO>> getUpcomingBookings() {
        List<BookingDTO> bookings = bookingService.getUpcomingBookings();
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/active")
    @Operation(summary = "Get currently active bookings")
    public ResponseEntity<List<BookingDTO>> getActiveBookings() {
        List<BookingDTO> bookings = bookingService.getActiveBookings();
        return ResponseEntity.ok(bookings);
    }
    
    @GetMapping("/check-availability")
    @Operation(summary = "Check if property is available for dates")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @RequestParam Long rentalId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        boolean isAvailable = bookingService.checkAvailability(rentalId, startDate, endDate);
        
        Map<String, Object> response = new HashMap<>();
        response.put("rentalId", rentalId);
        response.put("startDate", startDate);
        response.put("endDate", endDate);
        response.put("available", isAvailable);
        
        return ResponseEntity.ok(response);
    }
}

