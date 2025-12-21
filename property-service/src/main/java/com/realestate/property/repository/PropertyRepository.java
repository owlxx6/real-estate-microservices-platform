package com.realestate.property.repository;

import com.realestate.property.model.Property;
import com.realestate.property.model.PropertyStatus;
import com.realestate.property.model.PropertyType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    
    List<Property> findByAgentId(Long agentId);
    
    Page<Property> findByStatus(PropertyStatus status, Pageable pageable);
    
    Page<Property> findByType(PropertyType type, Pageable pageable);
    
    Page<Property> findByCity(String city, Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Property p WHERE p.status = :status")
    Long countByStatus(@Param("status") PropertyStatus status);
    
    @Query("SELECT COUNT(p) FROM Property p WHERE p.type = :type")
    Long countByType(@Param("type") PropertyType type);
    
    @Query("SELECT p.city, COUNT(p) FROM Property p GROUP BY p.city")
    List<Object[]> countByCity();
    
    @Query("SELECT p FROM Property p WHERE p.createdAt >= :since")
    List<Property> findRecentProperties(@Param("since") LocalDateTime since);
}

