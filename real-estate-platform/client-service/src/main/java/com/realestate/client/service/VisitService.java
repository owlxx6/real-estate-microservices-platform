package com.realestate.client.service;

import com.realestate.client.dto.VisitRequestDTO;
import com.realestate.client.feign.PropertyServiceClient;
import com.realestate.client.model.Client;
import com.realestate.client.model.Visit;
import com.realestate.client.model.Visit.VisitStatus;
import com.realestate.client.repository.ClientRepository;
import com.realestate.client.repository.VisitRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class VisitService {
    private final VisitRepository visitRepository;
    private final ClientRepository clientRepository;
    private final PropertyServiceClient propertyServiceClient;
    
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
    
    /**
     * Create a visit from DTO, automatically finding or creating client from email
     */
    public Visit createVisitFromDTO(VisitRequestDTO dto, String userEmail) {
        // Find or create client by email
        Client client = clientRepository.findByEmail(userEmail)
            .orElseGet(() -> {
                // Create new client if not found
                Client newClient = new Client();
                newClient.setEmail(userEmail);
                String emailPrefix = userEmail.split("@")[0];
                newClient.setFirstName(emailPrefix);
                newClient.setLastName("Client"); // Default last name to satisfy validation
                newClient.setPhone("0000000000"); // Default phone to satisfy validation
                newClient.setType(Client.ClientType.BUYER);
                Client saved = clientRepository.save(newClient);
                log.info("Created new client with ID: {} for email: {}", saved.getId(), userEmail);
                return saved;
            });
        
        // Get agent ID from property
        Long agentId = null;
        try {
            Map<String, Object> property = propertyServiceClient.getPropertyById(dto.getPropertyId());
            if (property != null && property.get("agentId") != null) {
                agentId = Long.valueOf(property.get("agentId").toString());
            }
        } catch (Exception e) {
            log.warn("Could not fetch property details for visit, agentId will remain null: {}", e.getMessage());
        }
        
        Visit visit = new Visit();
        visit.setPropertyId(dto.getPropertyId());
        visit.setClientId(client.getId());
        visit.setAgentId(agentId);
        visit.setVisitDate(dto.getVisitDate());
        visit.setStatus(VisitStatus.SCHEDULED);
        visit.setNotes(dto.getNotes());
        
        Visit saved = visitRepository.save(visit);
        log.info("Visit created with id: {} for property: {} and client: {}", 
            saved.getId(), dto.getPropertyId(), client.getId());
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
