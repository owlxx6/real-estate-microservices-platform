package com.realestate.client.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "visits", indexes = {
    @Index(name = "idx_property", columnList = "property_id"),
    @Index(name = "idx_client", columnList = "client_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_visit_date", columnList = "visit_date")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Visit {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Property ID is required")
    @Column(name = "property_id", nullable = false)
    private Long propertyId;
    
    @NotNull(message = "Client ID is required")
    @Column(name = "client_id", nullable = false)
    private Long clientId;
    
    @NotNull(message = "Visit date is required")
    @Column(name = "visit_date", nullable = false)
    private LocalDateTime visitDate;
    
    @NotNull(message = "Visit status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VisitStatus status;
    
    @Column(length = 1000)
    private String notes;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

