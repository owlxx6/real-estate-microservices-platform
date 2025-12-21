package com.realestate.property.dto;

import com.realestate.property.model.PropertyStatus;
import com.realestate.property.model.PropertyType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDTO {
    private Long id;
    private String title;
    private String description;
    private PropertyType type;
    private BigDecimal price;
    private Integer surface;
    private Integer rooms;
    private Integer bathrooms;
    private String address;
    private String city;
    private PropertyStatus status;
    private Long agentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

