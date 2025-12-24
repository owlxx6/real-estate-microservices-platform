package com.realestate.rental.service;

import com.realestate.rental.dto.CalendarDTO;
import com.realestate.rental.dto.RentalPropertyDTO;
import com.realestate.rental.exception.InvalidBookingException;
import com.realestate.rental.exception.ResourceNotFoundException;
import com.realestate.rental.feign.PropertyServiceClient;
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
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RentalPropertyService {
    
    private final RentalPropertyRepository rentalPropertyRepository;
    private final BookingRepository bookingRepository;
    private final PropertyServiceClient propertyServiceClient;
    
    @Transactional
    public RentalPropertyDTO createRentalProperty(RentalProperty rentalProperty) {
        log.info("Creating rental property for property ID: {}", rentalProperty.getPropertyId());
        
        // Vérifier si la propriété existe via Feign
        try {
            Map<String, Object> property = propertyServiceClient.getPropertyById(rentalProperty.getPropertyId());
            if (property == null) {
                throw new ResourceNotFoundException("Property not found with ID: " + rentalProperty.getPropertyId());
            }
        } catch (Exception e) {
            throw new ResourceNotFoundException("Unable to verify property existence: " + e.getMessage());
        }
        
        // Vérifier si la propriété n'est pas déjà en location
        if (rentalPropertyRepository.existsByPropertyId(rentalProperty.getPropertyId())) {
            throw new InvalidBookingException("Property is already activated for rental");
        }
        
        RentalProperty saved = rentalPropertyRepository.save(rentalProperty);
        log.info("Rental property created with ID: {}", saved.getId());
        
        return enrichWithPropertyDetails(RentalPropertyDTO.fromEntity(saved));
    }
    
    @Transactional
    public RentalPropertyDTO updateRentalProperty(Long id, RentalProperty rentalPropertyDetails) {
        log.info("Updating rental property ID: {}", id);
        
        RentalProperty rentalProperty = rentalPropertyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Rental property not found with ID: " + id));
        
        rentalProperty.setPricePerNight(rentalPropertyDetails.getPricePerNight());
        rentalProperty.setCleaningFee(rentalPropertyDetails.getCleaningFee());
        rentalProperty.setMaxGuests(rentalPropertyDetails.getMaxGuests());
        rentalProperty.setRules(rentalPropertyDetails.getRules());
        rentalProperty.setCheckInTime(rentalPropertyDetails.getCheckInTime());
        rentalProperty.setCheckOutTime(rentalPropertyDetails.getCheckOutTime());
        rentalProperty.setIsActive(rentalPropertyDetails.getIsActive());
        
        RentalProperty updated = rentalPropertyRepository.save(rentalProperty);
        log.info("Rental property updated: {}", updated.getId());
        
        return enrichWithPropertyDetails(RentalPropertyDTO.fromEntity(updated));
    }
    
    @Transactional
    public void deactivateRentalProperty(Long id) {
        log.info("Deactivating rental property ID: {}", id);
        
        RentalProperty rentalProperty = rentalPropertyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Rental property not found with ID: " + id));
        
        rentalProperty.setIsActive(false);
        rentalPropertyRepository.save(rentalProperty);
        
        log.info("Rental property deactivated: {}", id);
    }
    
    public RentalPropertyDTO getRentalPropertyById(Long id) {
        RentalProperty rentalProperty = rentalPropertyRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Rental property not found with ID: " + id));
        
        return enrichWithPropertyDetails(RentalPropertyDTO.fromEntity(rentalProperty));
    }
    
    public RentalPropertyDTO getRentalPropertyByPropertyId(Long propertyId) {
        RentalProperty rentalProperty = rentalPropertyRepository.findByPropertyId(propertyId)
            .orElseThrow(() -> new ResourceNotFoundException("No rental property found for property ID: " + propertyId));
        
        return enrichWithPropertyDetails(RentalPropertyDTO.fromEntity(rentalProperty));
    }
    
    public List<RentalPropertyDTO> getAllActiveRentals() {
        List<RentalProperty> rentals = rentalPropertyRepository.findByIsActiveTrue();
        return rentals.stream()
            .map(RentalPropertyDTO::fromEntity)
            .map(this::enrichWithPropertyDetails)
            .collect(Collectors.toList());
    }
    
    public List<RentalPropertyDTO> searchAvailableRentals(
            LocalDate startDate,
            LocalDate endDate,
            Integer guests,
            BigDecimal minPrice,
            BigDecimal maxPrice) {
        
        log.info("Searching rentals: dates={} to {}, guests={}, price={}-{}",
            startDate, endDate, guests, minPrice, maxPrice);
        
        // Rechercher les biens louables selon les critères
        List<RentalProperty> rentals = rentalPropertyRepository.searchRentals(minPrice, maxPrice, guests);
        
        // Filtrer par disponibilité si des dates sont fournies
        if (startDate != null && endDate != null) {
            rentals = rentals.stream()
                .filter(rental -> !bookingRepository.existsOverlappingBooking(
                    rental.getId(), startDate, endDate))
                .collect(Collectors.toList());
        }
        
        return rentals.stream()
            .map(RentalPropertyDTO::fromEntity)
            .map(this::enrichWithPropertyDetails)
            .collect(Collectors.toList());
    }
    
    public CalendarDTO getAvailabilityCalendar(Long rentalPropertyId, int year, int month) {
        log.info("Getting availability calendar for rental property ID: {}, year: {}, month: {}", 
            rentalPropertyId, year, month);
        
        RentalProperty rentalProperty = rentalPropertyRepository.findById(rentalPropertyId)
            .orElseThrow(() -> new ResourceNotFoundException("Rental property not found with ID: " + rentalPropertyId));
        
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        
        List<Booking> bookings = bookingRepository.findConfirmedBookingsInPeriod(
            rentalPropertyId, startDate, endDate);
        
        List<LocalDate> blockedDates = new ArrayList<>();
        Map<LocalDate, CalendarDTO.BookingInfo> bookingInfoMap = new HashMap<>();
        
        for (Booking booking : bookings) {
            LocalDate current = booking.getStartDate();
            while (!current.isAfter(booking.getEndDate())) {
                if (!current.isBefore(startDate) && !current.isAfter(endDate)) {
                    blockedDates.add(current);
                    bookingInfoMap.put(current, new CalendarDTO.BookingInfo(
                        booking.getId(),
                        booking.getGuestName(),
                        booking.getStartDate(),
                        booking.getEndDate()
                    ));
                }
                current = current.plusDays(1);
            }
        }
        
        return new CalendarDTO(rentalPropertyId, year, month, blockedDates, bookingInfoMap);
    }
    
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        long activeRentals = rentalPropertyRepository.countByIsActiveTrue();
        long totalRentals = rentalPropertyRepository.count();
        long pendingBookings = bookingRepository.countByStatus(BookingStatus.PENDING);
        long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long completedBookings = bookingRepository.countByStatus(BookingStatus.COMPLETED);
        long cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);
        
        stats.put("activeRentals", activeRentals);
        stats.put("totalRentals", totalRentals);
        stats.put("pendingBookings", pendingBookings);
        stats.put("confirmedBookings", confirmedBookings);
        stats.put("completedBookings", completedBookings);
        stats.put("cancelledBookings", cancelledBookings);
        
        return stats;
    }
    
    // Méthode pour enrichir le DTO avec les détails de la propriété
    private RentalPropertyDTO enrichWithPropertyDetails(RentalPropertyDTO dto) {
        try {
            Map<String, Object> property = propertyServiceClient.getPropertyById(dto.getPropertyId());
            if (property != null) {
                dto.setPropertyTitle((String) property.get("title"));
                dto.setPropertyCity((String) property.get("city"));
                dto.setPropertyType((String) property.get("type"));
                dto.setPropertyRooms((Integer) property.get("rooms"));
                dto.setPropertyBathrooms((Integer) property.get("bathrooms"));
                dto.setPropertySurface((Integer) property.get("surface"));
                dto.setPropertyAddress((String) property.get("address"));
            }
        } catch (Exception e) {
            log.warn("Could not fetch property details for property ID: {}", dto.getPropertyId(), e);
        }
        return dto;
    }
}

