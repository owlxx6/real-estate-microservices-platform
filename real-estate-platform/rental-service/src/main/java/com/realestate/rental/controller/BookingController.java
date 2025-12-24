package com.realestate.rental.controller;

import com.realestate.rental.dto.BookingDTO;
import com.realestate.rental.dto.BookingRequestDTO;
import com.realestate.rental.service.BookingService;
import com.realestate.rental.util.RoleChecker;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
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
    private final RoleChecker roleChecker;
    
    @GetMapping
    @Operation(summary = "Get all bookings - CLIENT sees only own, AGENT/ADMIN see all")
    public ResponseEntity<List<BookingDTO>> getAllBookings(HttpServletRequest request) {
        String role = roleChecker.getRoleFromRequest(request);
        if (role.equals("CLIENT")) {
            String userEmail = roleChecker.getEmailFromRequest(request);
            List<BookingDTO> bookings = bookingService.getBookingsByGuestEmail(userEmail);
            return ResponseEntity.ok(bookings);
        } else {
            // AGENT and ADMIN can see all
            roleChecker.checkAnyRole(request, RoleChecker.Role.AGENT, RoleChecker.Role.ADMIN);
            List<BookingDTO> bookings = bookingService.getAllBookings();
            return ResponseEntity.ok(bookings);
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID - CLIENT sees only own")
    public ResponseEntity<BookingDTO> getBookingById(
            @PathVariable Long id,
            HttpServletRequest request) {
        BookingDTO booking = bookingService.getBookingById(id);
        
        // CLIENT can only see their own bookings
        String role = roleChecker.getRoleFromRequest(request);
        if (role.equals("CLIENT")) {
            String userEmail = roleChecker.getEmailFromRequest(request);
            if (!booking.getGuestEmail().equals(userEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        
        return ResponseEntity.ok(booking);
    }
    
    @PostMapping
    @Operation(summary = "Create a new booking")
    public ResponseEntity<BookingDTO> createBooking(
            @Valid @RequestBody BookingRequestDTO request,
            HttpServletRequest httpRequest) {
        // Pour les clients, utiliser l'email du token JWT au lieu de l'email fourni dans la requête
        String role = roleChecker.getRoleFromRequest(httpRequest);
        if (role.equals("CLIENT")) {
            String userEmail = roleChecker.getEmailFromRequest(httpRequest);
            if (userEmail != null && !userEmail.isEmpty()) {
                // Override l'email avec celui du token JWT pour garantir la cohérence
                request.setGuestEmail(userEmail);
            }
        }
        BookingDTO created = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}/confirm")
    @Operation(summary = "Confirm a pending booking - AGENT/ADMIN only")
    public ResponseEntity<BookingDTO> confirmBooking(
            @PathVariable Long id,
            HttpServletRequest request) {
        roleChecker.checkAnyRole(request, RoleChecker.Role.AGENT, RoleChecker.Role.ADMIN);
        BookingDTO confirmed = bookingService.confirmBooking(id);
        return ResponseEntity.ok(confirmed);
    }
    
    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking - CLIENT can cancel own, AGENT/ADMIN can cancel any")
    public ResponseEntity<BookingDTO> cancelBooking(
            @PathVariable Long id,
            HttpServletRequest request) {
        String role = roleChecker.getRoleFromRequest(request);
        
        // CLIENT can only cancel their own bookings
        if (role.equals("CLIENT")) {
            BookingDTO booking = bookingService.getBookingById(id);
            String userEmail = roleChecker.getEmailFromRequest(request);
            if (!booking.getGuestEmail().equals(userEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        } else {
            // AGENT and ADMIN can cancel any
            roleChecker.checkAnyRole(request, RoleChecker.Role.AGENT, RoleChecker.Role.ADMIN);
        }
        
        BookingDTO cancelled = bookingService.cancelBooking(id);
        return ResponseEntity.ok(cancelled);
    }
    
    @PutMapping("/{id}/complete")
    @Operation(summary = "Mark booking as completed - AGENT/ADMIN only")
    public ResponseEntity<BookingDTO> completeBooking(
            @PathVariable Long id,
            HttpServletRequest request) {
        roleChecker.checkAnyRole(request, RoleChecker.Role.AGENT, RoleChecker.Role.ADMIN);
        BookingDTO completed = bookingService.completeBooking(id);
        return ResponseEntity.ok(completed);
    }
    
    @GetMapping("/rental/{rentalId}")
    @Operation(summary = "Get bookings for a rental property - AGENT/ADMIN only")
    public ResponseEntity<List<BookingDTO>> getBookingsByRentalProperty(
            @PathVariable Long rentalId,
            HttpServletRequest request) {
        roleChecker.checkAnyRole(request, RoleChecker.Role.AGENT, RoleChecker.Role.ADMIN);
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
    
    @GetMapping("/booked-dates/{propertyId}")
    @Operation(summary = "Get all booked dates for a property (by propertyId)")
    public ResponseEntity<Map<String, Object>> getBookedDates(@PathVariable Long propertyId) {
        List<String> bookedDates = bookingService.getBookedDatesByPropertyId(propertyId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("propertyId", propertyId);
        response.put("bookedDates", bookedDates);
        
        return ResponseEntity.ok(response);
    }
}

