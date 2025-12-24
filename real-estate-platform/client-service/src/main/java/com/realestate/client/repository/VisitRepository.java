package com.realestate.client.repository;

import com.realestate.client.model.Visit;
import com.realestate.client.model.Visit.VisitStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    List<Visit> findByClientId(Long clientId);
    List<Visit> findByPropertyId(Long propertyId);
    List<Visit> findByAgentId(Long agentId);
    Page<Visit> findByStatus(VisitStatus status, Pageable pageable);
    List<Visit> findByVisitDateAfter(LocalDateTime date);
    List<Visit> findByVisitDateBetween(LocalDateTime start, LocalDateTime end);
    long countByStatus(VisitStatus status);
}

