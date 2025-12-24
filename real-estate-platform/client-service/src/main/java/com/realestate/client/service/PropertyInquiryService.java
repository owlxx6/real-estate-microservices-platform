package com.realestate.client.service;

import com.realestate.client.feign.PropertyServiceClient;
import com.realestate.client.model.PropertyInquiry;
import com.realestate.client.repository.PropertyInquiryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PropertyInquiryService {
    private final PropertyInquiryRepository inquiryRepository;
    private final PropertyServiceClient propertyServiceClient;
    
    public Page<PropertyInquiry> getAllInquiries(Pageable pageable) {
        return inquiryRepository.findAll(pageable);
    }
    
    public PropertyInquiry getInquiryById(Long id) {
        return inquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found with id: " + id));
    }
    
    public PropertyInquiry createInquiry(PropertyInquiry inquiry) {
        // Récupérer l'agent de la propriété
        try {
            Map<String, Object> property = propertyServiceClient.getPropertyById(inquiry.getPropertyId());
            if (property != null && property.get("agentId") != null) {
                Long agentId = Long.valueOf(property.get("agentId").toString());
                inquiry.setAgentId(agentId);
                log.info("Assigned agent ID {} to inquiry for property {}", agentId, inquiry.getPropertyId());
            }
        } catch (Exception e) {
            log.warn("Could not fetch property details for inquiry, agentId will remain null: {}", e.getMessage());
        }
        
        PropertyInquiry saved = inquiryRepository.save(inquiry);
        log.info("Property inquiry created with id: {} for property: {}", saved.getId(), inquiry.getPropertyId());
        return saved;
    }
    
    public PropertyInquiry updateInquiry(Long id, PropertyInquiry inquiryDetails) {
        PropertyInquiry inquiry = getInquiryById(id);
        if (inquiryDetails.getStatus() != null) {
            inquiry.setStatus(inquiryDetails.getStatus());
        }
        if (inquiryDetails.getAgentResponse() != null) {
            inquiry.setAgentResponse(inquiryDetails.getAgentResponse());
        }
        return inquiryRepository.save(inquiry);
    }
    
    public void deleteInquiry(Long id) {
        inquiryRepository.deleteById(id);
        log.info("Inquiry deleted with id: {}", id);
    }
    
    public List<PropertyInquiry> getInquiriesByProperty(Long propertyId) {
        return inquiryRepository.findByPropertyId(propertyId);
    }
    
    public List<PropertyInquiry> getInquiriesByAgent(Long agentId) {
        return inquiryRepository.findByAgentId(agentId);
    }
    
    public Page<PropertyInquiry> getInquiriesByProperty(Long propertyId, Pageable pageable) {
        return inquiryRepository.findByPropertyId(propertyId, pageable);
    }
    
    public Page<PropertyInquiry> getInquiriesByAgent(Long agentId, Pageable pageable) {
        return inquiryRepository.findByAgentId(agentId, pageable);
    }
    
    public List<PropertyInquiry> getInquiriesByEmail(String email) {
        return inquiryRepository.findByEmail(email);
    }
    
    public Page<PropertyInquiry> getInquiriesByEmail(String email, Pageable pageable) {
        return inquiryRepository.findByEmail(email, pageable);
    }
}

