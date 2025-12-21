package com.realestate.client.service;

import com.realestate.client.model.Visit;
import com.realestate.client.model.VisitStatus;
import com.realestate.client.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VisitService {
    
    private final VisitRepository visitRepository;
    
    // Custom configuration property from Config Server
    @Value("${mes-config-ms.visits-last:15}")
    private Integer visitsLastDays;
    
    public Visit createVisit(Visit visit) {
        log.info("Creating new visit for property {} and client {}", visit.getPropertyId(), visit.getClientId());
        return visitRepository.save(visit);
    }
    
    public Visit getVisitById(Long id) {
        log.info("Fetching visit with id: {}", id);
        return visitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit not found with id: " + id));
    }
    
    public Page<Visit> getAllVisits(Pageable pageable) {
        log.info("Fetching all visits with pagination");
        return visitRepository.findAll(pageable);
    }
    
    public Visit updateVisit(Long id, Visit visitDetails) {
        log.info("Updating visit with id: {}", id);
        Visit visit = visitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit not found with id: " + id));
        
        visit.setPropertyId(visitDetails.getPropertyId());
        visit.setClientId(visitDetails.getClientId());
        visit.setVisitDate(visitDetails.getVisitDate());
        visit.setStatus(visitDetails.getStatus());
        visit.setNotes(visitDetails.getNotes());
        
        return visitRepository.save(visit);
    }
    
    public void deleteVisit(Long id) {
        log.info("Deleting visit with id: {}", id);
        if (!visitRepository.existsById(id)) {
            throw new RuntimeException("Visit not found with id: " + id);
        }
        visitRepository.deleteById(id);
    }
    
    public List<Visit> getVisitsByClient(Long clientId) {
        log.info("Fetching visits for client: {}", clientId);
        return visitRepository.findByClientIdOrderByVisitDateDesc(clientId);
    }
    
    public List<Visit> getVisitsByProperty(Long propertyId) {
        log.info("Fetching visits for property: {}", propertyId);
        return visitRepository.findByPropertyId(propertyId);
    }
    
    public Page<Visit> getVisitsByStatus(VisitStatus status, Pageable pageable) {
        log.info("Fetching visits by status: {}", status);
        return visitRepository.findByStatus(status, pageable);
    }
    
    /**
     * Get recent visits using custom configuration property
     * Uses mes-config-ms.visits-last to determine recent visits
     */
    public List<Visit> getRecentVisits() {
        log.info("Fetching recent visits from last {} days", visitsLastDays);
        LocalDateTime sinceDate = LocalDateTime.now().minusDays(visitsLastDays);
        List<Visit> recentVisits = visitRepository.findRecentVisits(sinceDate);
        log.info("Found {} recent visits (last {} days)", recentVisits.size(), visitsLastDays);
        return recentVisits;
    }
    
    public Long countVisitsByStatus(VisitStatus status) {
        return visitRepository.countByStatus(status);
    }
}

