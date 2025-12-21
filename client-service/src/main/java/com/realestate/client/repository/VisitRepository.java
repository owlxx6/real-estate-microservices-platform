package com.realestate.client.repository;

import com.realestate.client.model.Visit;
import com.realestate.client.model.VisitStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    
    List<Visit> findByClientId(Long clientId);
    
    List<Visit> findByPropertyId(Long propertyId);
    
    Page<Visit> findByStatus(VisitStatus status, Pageable pageable);
    
    @Query("SELECT v FROM Visit v WHERE v.clientId = :clientId ORDER BY v.visitDate DESC")
    List<Visit> findByClientIdOrderByVisitDateDesc(@Param("clientId") Long clientId);
    
    @Query("SELECT v FROM Visit v WHERE v.createdAt >= :since")
    List<Visit> findRecentVisits(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(v) FROM Visit v WHERE v.status = :status")
    Long countByStatus(@Param("status") VisitStatus status);
}

