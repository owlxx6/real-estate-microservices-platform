package com.realestate.property.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "properties", indexes = {
    @Index(name = "idx_city", columnList = "city"),
    @Index(name = "idx_type", columnList = "type"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_price", columnList = "price"),
    @Index(name = "idx_agent", columnList = "agent_id"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Property {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200, message = "Title must be between 3 and 200 characters")
    @Column(nullable = false, length = 200)
    private String title;
    
    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 2000, message = "Description must be between 10 and 2000 characters")
    @Column(nullable = false, length = 2000)
    private String description;
    
    @NotNull(message = "Property type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PropertyType type;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;
    
    @NotNull(message = "Surface is required")
    @Min(value = 1, message = "Surface must be at least 1 m²")
    @Column(nullable = false)
    private Integer surface;
    
    @NotNull(message = "Number of rooms is required")
    @Min(value = 1, message = "Must have at least 1 room")
    @Column(nullable = false)
    private Integer rooms;
    
    @NotNull(message = "Number of bathrooms is required")
    @Min(value = 1, message = "Must have at least 1 bathroom")
    @Column(nullable = false)
    private Integer bathrooms;
    
    @NotBlank(message = "Address is required")
    @Column(nullable = false)
    private String address;
    
    @NotBlank(message = "City is required")
    @Column(nullable = false, length = 100)
    private String city;
    
    @NotNull(message = "Property status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PropertyStatus status;
    
    @NotNull(message = "Agent ID is required")
    @Column(name = "agent_id", nullable = false)
    private Long agentId;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

