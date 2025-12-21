package com.realestate.interfaceapi.controller;

import com.realestate.interfaceapi.dto.VisitDTO;
import com.realestate.interfaceapi.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Property visit booking orchestration")
@CrossOrigin(origins = "*")
public class BookingController {
    
    private final BookingService bookingService;
    
    @PostMapping
    @Operation(summary = "Create a visit booking (orchestrates client and property services)")
    public ResponseEntity<VisitDTO> createBooking(@RequestBody VisitDTO visitRequest) {
        VisitDTO createdVisit = bookingService.createBooking(visitRequest);
        return new ResponseEntity<>(createdVisit, HttpStatus.CREATED);
    }
}

