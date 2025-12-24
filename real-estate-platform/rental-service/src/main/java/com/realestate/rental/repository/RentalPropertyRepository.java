package com.realestate.rental.repository;

import com.realestate.rental.model.RentalProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RentalPropertyRepository extends JpaRepository<RentalProperty, Long> {
    
    // Trouver un bien louable par l'ID de la propriété
    Optional<RentalProperty> findByPropertyId(Long propertyId);
    
    // Lister tous les biens actifs
    List<RentalProperty> findByIsActiveTrue();
    
    // Recherche par prix
    List<RentalProperty> findByIsActiveTrueAndPricePerNightBetween(BigDecimal minPrice, BigDecimal maxPrice);
    
    // Recherche par capacité
    List<RentalProperty> findByIsActiveTrueAndMaxGuestsGreaterThanEqual(Integer guests);
    
    // Recherche combinée
    @Query("SELECT rp FROM RentalProperty rp WHERE rp.isActive = true " +
           "AND (:minPrice IS NULL OR rp.pricePerNight >= :minPrice) " +
           "AND (:maxPrice IS NULL OR rp.pricePerNight <= :maxPrice) " +
           "AND (:guests IS NULL OR rp.maxGuests >= :guests)")
    List<RentalProperty> searchRentals(
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("guests") Integer guests
    );
    
    // Vérifier si une propriété est déjà en location
    boolean existsByPropertyId(Long propertyId);
    
    // Compter les biens actifs
    long countByIsActiveTrue();
}

