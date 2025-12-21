package com.realestate.client.dto;

import com.realestate.client.model.Agent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgentPortfolioDTO {
    private Agent agent;
    private List<PropertyDTO> properties;
    private Integer propertyCount;
}

