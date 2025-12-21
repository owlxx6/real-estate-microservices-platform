package com.realestate.client.feign;

import com.realestate.client.dto.PropertyDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "property-service")
public interface PropertyServiceClient {
    
    @GetMapping("/api/properties/agent/{agentId}")
    List<PropertyDTO> getPropertiesByAgent(@PathVariable("agentId") Long agentId);
    
    @GetMapping("/api/properties/{id}")
    PropertyDTO getPropertyById(@PathVariable("id") Long id);
}

