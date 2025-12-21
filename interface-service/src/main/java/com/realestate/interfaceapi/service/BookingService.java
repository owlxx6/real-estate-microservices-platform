package com.realestate.interfaceapi.service;

import com.realestate.interfaceapi.dto.VisitDTO;
import com.realestate.interfaceapi.feign.ClientServiceClient;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {
    
    private final ClientServiceClient clientServiceClient;
    
    /**
     * Create a visit booking (orchestrates communication with client service)
     */
    @CircuitBreaker(name = "clientService", fallbackMethod = "createBookingFallback")
    public VisitDTO createBooking(VisitDTO visitRequest) {
        log.info("Creating booking for property {} and client {}", 
                visitRequest.getPropertyId(), visitRequest.getClientId());
        
        // Create visit through client service
        VisitDTO createdVisit = clientServiceClient.createVisit(visitRequest);
        
        log.info("Booking created successfully with ID: {}", createdVisit.getId());
        return createdVisit;
    }
    
    public VisitDTO createBookingFallback(VisitDTO visitRequest, Exception e) {
        log.error("Failed to create booking: {}", e.getMessage());
        throw new RuntimeException("Booking service temporarily unavailable. Please try again later.");
    }
}

