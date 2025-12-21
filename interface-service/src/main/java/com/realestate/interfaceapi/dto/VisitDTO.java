package com.realestate.interfaceapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VisitDTO {
    private Long id;
    private Long propertyId;
    private Long clientId;
    private LocalDateTime visitDate;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
}

