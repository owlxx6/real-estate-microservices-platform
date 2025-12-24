package com.realestate.client.repository;

import com.realestate.client.model.PropertyInquiry;
import com.realestate.client.model.PropertyInquiry.InquiryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyInquiryRepository extends JpaRepository<PropertyInquiry, Long> {
    List<PropertyInquiry> findByPropertyId(Long propertyId);
    List<PropertyInquiry> findByAgentId(Long agentId);
    List<PropertyInquiry> findByEmail(String email);
    Page<PropertyInquiry> findByPropertyId(Long propertyId, Pageable pageable);
    Page<PropertyInquiry> findByAgentId(Long agentId, Pageable pageable);
    Page<PropertyInquiry> findByEmail(String email, Pageable pageable);
    Page<PropertyInquiry> findByStatus(InquiryStatus status, Pageable pageable);
    long countByPropertyIdAndStatus(Long propertyId, InquiryStatus status);
    long countByAgentIdAndStatus(Long agentId, InquiryStatus status);
}

