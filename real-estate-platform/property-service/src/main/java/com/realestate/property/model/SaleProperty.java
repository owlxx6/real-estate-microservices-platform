package com.realestate.property.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sale_properties", indexes = {
    @Index(name = "idx_property_id", columnList = "property_id"),
    @Index(name = "idx_sale_status", columnList = "sale_status"),
    @Index(name = "idx_is_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaleProperty {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Property ID is required")
    @Column(name = "property_id", nullable = false, unique = true)
    private Long propertyId;  // Référence vers Property
    
    @NotNull(message = "Sale price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Sale price must be greater than 0")
    @Column(name = "sale_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal salePrice;
    
    @NotNull(message = "Sale status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "sale_status", nullable = false, length = 20)
    private SaleStatus saleStatus = SaleStatus.FOR_SALE;
    
    @Column(name = "sold_at")
    private LocalDateTime soldAt;
    
    @DecimalMin(value = "0.0", message = "Sold price must be positive")
    @Column(name = "sold_price", precision = 15, scale = 2)
    private BigDecimal soldPrice;  // Prix réel de vente (peut différer du prix demandé)
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
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
    
    // Enum pour les statuts de vente
    public enum SaleStatus {
        FOR_SALE,    // À vendre
        RESERVED,    // Réservé (offre acceptée, en cours de transaction)
        SOLD         // Vendu
    }
}

