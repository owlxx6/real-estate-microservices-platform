package com.realestate.rental.controller;

import com.realestate.rental.dto.CalendarDTO;
import com.realestate.rental.dto.RentalPropertyDTO;
import com.realestate.rental.model.RentalProperty;
import com.realestate.rental.service.RentalPropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
@Tag(name = "Rental Properties", description = "Rental property management APIs")
public class RentalPropertyController {
    
    private final RentalPropertyService rentalPropertyService;
    
    @GetMapping
    @Operation(summary = "Get all active rental properties")
    public ResponseEntity<List<RentalPropertyDTO>> getAllActiveRentals() {
        List<RentalPropertyDTO> rentals = rentalPropertyService.getAllActiveRentals();
        return ResponseEntity.ok(rentals);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get rental property by ID")
    public ResponseEntity<RentalPropertyDTO> getRentalPropertyById(@PathVariable Long id) {
        RentalPropertyDTO rental = rentalPropertyService.getRentalPropertyById(id);
        return ResponseEntity.ok(rental);
    }
    
    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get rental property by property ID")
    public ResponseEntity<RentalPropertyDTO> getRentalPropertyByPropertyId(@PathVariable Long propertyId) {
        RentalPropertyDTO rental = rentalPropertyService.getRentalPropertyByPropertyId(propertyId);
        return ResponseEntity.ok(rental);
    }
    
    @PostMapping
    @Operation(summary = "Create/activate a property for rental")
    public ResponseEntity<RentalPropertyDTO> createRentalProperty(@Valid @RequestBody RentalProperty rentalProperty) {
        RentalPropertyDTO created = rentalPropertyService.createRentalProperty(rentalProperty);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update rental property")
    public ResponseEntity<RentalPropertyDTO> updateRentalProperty(
            @PathVariable Long id,
            @Valid @RequestBody RentalProperty rentalProperty) {
        RentalPropertyDTO updated = rentalPropertyService.updateRentalProperty(id, rentalProperty);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate rental property")
    public ResponseEntity<Void> deactivateRentalProperty(@PathVariable Long id) {
        rentalPropertyService.deactivateRentalProperty(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search available rentals with filters")
    public ResponseEntity<List<RentalPropertyDTO>> searchAvailableRentals(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        
        List<RentalPropertyDTO> rentals = rentalPropertyService.searchAvailableRentals(
            startDate, endDate, guests, minPrice, maxPrice);
        return ResponseEntity.ok(rentals);
    }
    
    @GetMapping("/{id}/availability")
    @Operation(summary = "Get availability calendar for a rental property")
    public ResponseEntity<CalendarDTO> getAvailabilityCalendar(
            @PathVariable Long id,
            @RequestParam int year,
            @RequestParam int month) {
        
        CalendarDTO calendar = rentalPropertyService.getAvailabilityCalendar(id, year, month);
        return ResponseEntity.ok(calendar);
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get rental statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = rentalPropertyService.getStatistics();
        return ResponseEntity.ok(stats);
    }
}

