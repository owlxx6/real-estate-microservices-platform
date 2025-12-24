package com.realestate.property.repository;

import com.realestate.property.model.Property;
import com.realestate.property.model.Property.PropertyStatus;
import com.realestate.property.model.Property.PropertyType;
import com.realestate.property.model.Property.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    
    // Find by agent
    Page<Property> findByAgentId(Long agentId, Pageable pageable);
    
    // Find by status
    Page<Property> findByStatus(PropertyStatus status, Pageable pageable);
    
    // Find by transaction type
    Page<Property> findByTransactionType(TransactionType transactionType, Pageable pageable);
    
    // Find by city
    Page<Property> findByCity(String city, Pageable pageable);
    
    // Find by type
    Page<Property> findByType(PropertyType type, Pageable pageable);
    
    // Find by price range
    Page<Property> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);
    
    // Find recent properties
    List<Property> findByCreatedAtAfter(LocalDateTime date);
    
    // Count by status
    long countByStatus(PropertyStatus status);
    
    // Count by transaction type
    long countByTransactionType(TransactionType transactionType);
    
    // Statistics queries
    @Query("SELECT AVG(p.price) FROM Property p WHERE p.status = :status")
    BigDecimal findAveragePrice(@Param("status") PropertyStatus status);
    
    @Query("SELECT p.type, COUNT(p) FROM Property p GROUP BY p.type")
    List<Object[]> countByType();
    
    @Query("SELECT p.city, COUNT(p) FROM Property p GROUP BY p.city")
    List<Object[]> countByCity();
    
    @Query("SELECT p.transactionType, COUNT(p) FROM Property p GROUP BY p.transactionType")
    List<Object[]> countByTransactionType();
}

