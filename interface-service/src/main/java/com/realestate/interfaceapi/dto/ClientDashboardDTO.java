package com.realestate.interfaceapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientDashboardDTO {
    private ClientDTO client;
    private List<VisitDTO> visits;
    private List<PropertyWithAgentDTO> visitedProperties;
}

