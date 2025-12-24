package com.realestate.property.repository;

import com.realestate.property.model.SaleProperty;
import com.realestate.property.model.SaleProperty.SaleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalePropertyRepository extends JpaRepository<SaleProperty, Long> {
    
    // Trouver un bien à vendre par l'ID de la propriété
    Optional<SaleProperty> findByPropertyId(Long propertyId);
    
    // Vérifier si une propriété est déjà à vendre
    boolean existsByPropertyId(Long propertyId);
    
    // Lister tous les biens à vendre actifs
    List<SaleProperty> findByIsActiveTrueAndSaleStatus(SaleStatus status);
    
    // Lister tous les biens FOR_SALE actifs
    List<SaleProperty> findByIsActiveTrueAndSaleStatusOrderBySalePriceAsc(SaleStatus status);
    
    // Recherche par prix
    @Query("SELECT sp FROM SaleProperty sp WHERE sp.isActive = true " +
           "AND sp.saleStatus = 'FOR_SALE' " +
           "AND (:minPrice IS NULL OR sp.salePrice >= :minPrice) " +
           "AND (:maxPrice IS NULL OR sp.salePrice <= :maxPrice)")
    List<SaleProperty> searchByPrice(
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice
    );
    
    // Compter par statut
    long countBySaleStatus(SaleStatus status);
    
    // Compter les biens actifs à vendre
    long countByIsActiveTrueAndSaleStatus(SaleStatus status);
    
    // Total des ventes (montant)
    @Query("SELECT COALESCE(SUM(sp.soldPrice), 0) FROM SaleProperty sp WHERE sp.saleStatus = 'SOLD'")
    BigDecimal getTotalSalesAmount();
    
    // Prix moyen des biens à vendre
    @Query("SELECT AVG(sp.salePrice) FROM SaleProperty sp WHERE sp.isActive = true AND sp.saleStatus = 'FOR_SALE'")
    BigDecimal getAverageSalePrice();
}

