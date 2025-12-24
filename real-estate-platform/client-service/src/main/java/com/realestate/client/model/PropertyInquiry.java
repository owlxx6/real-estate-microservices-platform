package com.realestate.client.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "property_inquiries", indexes = {
    @Index(name = "idx_property_id", columnList = "property_id"),
    @Index(name = "idx_agent_id", columnList = "agent_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyInquiry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Property ID is required")
    @Column(name = "property_id", nullable = false)
    private Long propertyId;
    
    @Column(name = "agent_id")
    private Long agentId; // Agent responsable de la propriété
    
    @NotBlank(message = "Name is required")
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email
    @Size(max = 255)
    @Column(nullable = false)
    private String email;
    
    @Size(max = 20)
    @Column(length = 20)
    private String phone;
    
    @Size(max = 2000)
    @Column(length = 2000)
    private String message;
    
    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InquiryStatus status = InquiryStatus.NEW;
    
    @Column(name = "agent_response", length = 2000)
    private String agentResponse;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum InquiryStatus {
        NEW, CONTACTED, RESPONDED, CLOSED
    }
}

