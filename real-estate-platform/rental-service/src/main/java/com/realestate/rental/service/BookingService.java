package com.realestate.rental.service;

import com.realestate.rental.dto.BookingDTO;
import com.realestate.rental.dto.BookingRequestDTO;
import com.realestate.rental.exception.InvalidBookingException;
import com.realestate.rental.exception.PropertyNotAvailableException;
import com.realestate.rental.exception.ResourceNotFoundException;
import com.realestate.rental.model.Booking;
import com.realestate.rental.model.Booking.BookingStatus;
import com.realestate.rental.model.RentalProperty;
import com.realestate.rental.repository.BookingRepository;
import com.realestate.rental.repository.RentalPropertyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final RentalPropertyRepository rentalPropertyRepository;
    
    @Transactional
    public BookingDTO createBooking(BookingRequestDTO request) {
        log.info("Creating booking for rental property ID: {}", request.getRentalPropertyId());
        
        // 1. Vérifier que le bien louable existe et est actif
        RentalProperty rentalProperty = rentalPropertyRepository.findById(request.getRentalPropertyId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Rental property not found with ID: " + request.getRentalPropertyId()));
        
        if (!rentalProperty.getIsActive()) {
            throw new PropertyNotAvailableException("This property is not available for rental");
        }
        
        // 2. Valider les dates
        validateDates(request.getStartDate(), request.getEndDate());
        
        // 3. Vérifier la capacité
        if (request.getNumberOfGuests() > rentalProperty.getMaxGuests()) {
            throw new InvalidBookingException(
                String.format("Number of guests (%d) exceeds maximum capacity (%d)",
                    request.getNumberOfGuests(), rentalProperty.getMaxGuests()));
        }
        
        // 4. Vérifier la disponibilité
        boolean isAvailable = checkAvailability(
            request.getRentalPropertyId(),
            request.getStartDate(),
            request.getEndDate());
        
        if (!isAvailable) {
            throw new PropertyNotAvailableException(
                "Property is not available for the selected dates");
        }
        
        // 5. Calculer le prix total
        BigDecimal totalPrice = calculateTotalPrice(
            rentalProperty,
            request.getStartDate(),
            request.getEndDate());
        
        // 6. Créer la réservation
        Booking booking = new Booking();
        booking.setRentalPropertyId(request.getRentalPropertyId());
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setNumberOfGuests(request.getNumberOfGuests());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.PENDING);
        booking.setGuestName(request.getGuestName());
        booking.setGuestEmail(request.getGuestEmail());
        booking.setGuestPhone(request.getGuestPhone());
        booking.setSpecialRequests(request.getSpecialRequests());
        
        Booking saved = bookingRepository.save(booking);
        log.info("Booking created with ID: {}", saved.getId());
        
        return enrichBookingDTO(BookingDTO.fromEntity(saved), rentalProperty);
    }
    
    @Transactional
    public BookingDTO confirmBooking(Long bookingId) {
        log.info("Confirming booking ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException("Only pending bookings can be confirmed");
        }
        
        // Revérifier la disponibilité
        boolean isAvailable = checkAvailability(
            booking.getRentalPropertyId(),
            booking.getStartDate(),
            booking.getEndDate());
        
        if (!isAvailable) {
            throw new PropertyNotAvailableException(
                "Property is no longer available for the selected dates");
        }
        
        booking.setStatus(BookingStatus.CONFIRMED);
        Booking updated = bookingRepository.save(booking);
        
        log.info("Booking confirmed: {}", bookingId);
        return BookingDTO.fromEntity(updated);
    }
    
    @Transactional
    public BookingDTO cancelBooking(Long bookingId) {
        log.info("Cancelling booking ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new InvalidBookingException("Completed bookings cannot be cancelled");
        }
        
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingException("Booking is already cancelled");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);
        
        log.info("Booking cancelled: {}", bookingId);
        return BookingDTO.fromEntity(updated);
    }
    
    @Transactional
    public BookingDTO completeBooking(Long bookingId) {
        log.info("Completing booking ID: {}", bookingId);
        
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new InvalidBookingException("Only confirmed bookings can be completed");
        }
        
        booking.setStatus(BookingStatus.COMPLETED);
        Booking updated = bookingRepository.save(booking);
        
        log.info("Booking completed: {}", bookingId);
        return BookingDTO.fromEntity(updated);
    }
    
    public BookingDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        
        return BookingDTO.fromEntity(booking);
    }
    
    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
            .map(BookingDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    public List<BookingDTO> getBookingsByRentalProperty(Long rentalPropertyId) {
        return bookingRepository.findByRentalPropertyId(rentalPropertyId).stream()
            .map(BookingDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    public List<BookingDTO> getBookingsByGuestEmail(String email) {
        return bookingRepository.findByGuestEmailOrderByCreatedAtDesc(email).stream()
            .map(BookingDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    public List<BookingDTO> getBookingsByStatus(String status) {
        BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
        return bookingRepository.findByStatusOrderByStartDateAsc(bookingStatus).stream()
            .map(BookingDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    public List<BookingDTO> getUpcomingBookings() {
        return bookingRepository.findUpcomingBookings().stream()
            .map(BookingDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    public List<BookingDTO> getActiveBookings() {
        return bookingRepository.findActiveBookings().stream()
            .map(BookingDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    public boolean checkAvailability(Long rentalPropertyId, LocalDate startDate, LocalDate endDate) {
        return !bookingRepository.existsOverlappingBooking(rentalPropertyId, startDate, endDate);
    }
    
    // Méthodes privées de validation et calcul
    
    private void validateDates(LocalDate startDate, LocalDate endDate) {
        LocalDate today = LocalDate.now();
        
        if (startDate.isBefore(today)) {
            throw new InvalidBookingException("Start date cannot be in the past");
        }
        
        if (endDate.isBefore(startDate) || endDate.isEqual(startDate)) {
            throw new InvalidBookingException("End date must be after start date");
        }
        
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        if (days > 365) {
            throw new InvalidBookingException("Booking period cannot exceed 365 days");
        }
    }
    
    private BigDecimal calculateTotalPrice(RentalProperty rentalProperty, LocalDate startDate, LocalDate endDate) {
        long numberOfNights = ChronoUnit.DAYS.between(startDate, endDate);
        
        BigDecimal nightsPrice = rentalProperty.getPricePerNight()
            .multiply(BigDecimal.valueOf(numberOfNights));
        
        BigDecimal cleaningFee = rentalProperty.getCleaningFee() != null
            ? rentalProperty.getCleaningFee()
            : BigDecimal.ZERO;
        
        return nightsPrice.add(cleaningFee);
    }
    
    private BookingDTO enrichBookingDTO(BookingDTO dto, RentalProperty rentalProperty) {
        dto.setPricePerNight(rentalProperty.getPricePerNight());
        dto.setCleaningFee(rentalProperty.getCleaningFee());
        return dto;
    }
}

