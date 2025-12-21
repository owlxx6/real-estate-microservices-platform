package com.realestate.interfaceapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgentDashboardDTO {
    private AgentDTO agent;
    private List<PropertyDTO> properties;
    private Integer propertyCount;
    private List<VisitDTO> upcomingVisits;
}

