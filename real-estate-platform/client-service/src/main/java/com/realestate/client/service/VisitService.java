package com.realestate.client.service;

import com.realestate.client.model.Visit;
import com.realestate.client.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    
    public Page<Visit> getAllVisits(Pageable pageable) {
        return visitRepository.findAll(pageable);
    }
    
    public Visit getVisitById(Long id) {
        return visitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visit not found with id: " + id));
    }
    
    public Visit createVisit(Visit visit) {
        Visit saved = visitRepository.save(visit);
        log.info("Visit created with id: {}", saved.getId());
        return saved;
    }
    
    public Visit updateVisit(Long id, Visit visitDetails) {
        Visit visit = getVisitById(id);
        visit.setPropertyId(visitDetails.getPropertyId());
        visit.setClientId(visitDetails.getClientId());
        visit.setAgentId(visitDetails.getAgentId());
        visit.setVisitDate(visitDetails.getVisitDate());
        visit.setStatus(visitDetails.getStatus());
        visit.setNotes(visitDetails.getNotes());
        visit.setFeedback(visitDetails.getFeedback());
        visit.setRating(visitDetails.getRating());
        return visitRepository.save(visit);
    }
    
    public void deleteVisit(Long id) {
        visitRepository.deleteById(id);
        log.info("Visit deleted with id: {}", id);
    }
    
    public List<Visit> getVisitsByClient(Long clientId) {
        return visitRepository.findByClientId(clientId);
    }
    
    public List<Visit> getVisitsByProperty(Long propertyId) {
        return visitRepository.findByPropertyId(propertyId);
    }
    
    public List<Visit> getRecentVisits(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return visitRepository.findByVisitDateAfter(since);
    }
}
