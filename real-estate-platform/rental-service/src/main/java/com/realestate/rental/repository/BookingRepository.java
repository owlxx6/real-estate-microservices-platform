package com.realestate.rental.repository;

import com.realestate.rental.model.Booking;
import com.realestate.rental.model.Booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // Trouver toutes les réservations d'un bien
    List<Booking> findByRentalPropertyId(Long rentalPropertyId);
    
    // Trouver les réservations d'un bien avec un statut spécifique
    List<Booking> findByRentalPropertyIdAndStatus(Long rentalPropertyId, BookingStatus status);
    
    // Trouver les réservations d'un client par email
    List<Booking> findByGuestEmailOrderByCreatedAtDesc(String guestEmail);
    
    // Trouver les réservations par statut
    List<Booking> findByStatusOrderByStartDateAsc(BookingStatus status);
    
    // Vérifier si des dates sont déjà réservées (chevauchement)
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.rentalPropertyId = :rentalPropertyId " +
           "AND b.status = 'CONFIRMED' " +
           "AND ((b.startDate BETWEEN :startDate AND :endDate) " +
           "OR (b.endDate BETWEEN :startDate AND :endDate) " +
           "OR (b.startDate <= :startDate AND b.endDate >= :endDate))")
    boolean existsOverlappingBooking(
        @Param("rentalPropertyId") Long rentalPropertyId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // Trouver les réservations confirmées pour un bien dans une période
    @Query("SELECT b FROM Booking b WHERE b.rentalPropertyId = :rentalPropertyId " +
           "AND b.status = 'CONFIRMED' " +
           "AND b.endDate >= :startDate " +
           "AND b.startDate <= :endDate " +
           "ORDER BY b.startDate")
    List<Booking> findConfirmedBookingsInPeriod(
        @Param("rentalPropertyId") Long rentalPropertyId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    // Statistiques - Compter les réservations par statut
    long countByStatus(BookingStatus status);
    
    // Réservations à venir
    @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' " +
           "AND b.startDate >= CURRENT_DATE " +
           "ORDER BY b.startDate")
    List<Booking> findUpcomingBookings();
    
    // Réservations en cours
    @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' " +
           "AND b.startDate <= CURRENT_DATE " +
           "AND b.endDate >= CURRENT_DATE")
    List<Booking> findActiveBookings();
}

