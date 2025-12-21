package com.realestate.interfaceapi.dto;

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
    private String type;
    private BigDecimal price;
    private Integer surface;
    private Integer rooms;
    private Integer bathrooms;
    private String address;
    private String city;
    private String status;
    private Long agentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

