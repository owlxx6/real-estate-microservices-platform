package com.realestate.interfaceapi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyWithAgentDTO {
    private PropertyDTO property;
    private AgentDTO agent;
}

