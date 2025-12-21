package com.realestate.interfaceapi.feign;

import com.realestate.interfaceapi.dto.PropertyDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;
import java.util.Map;

@FeignClient(name = "property-service")
public interface PropertyServiceClient {
    
    @GetMapping("/api/properties/{id}")
    PropertyDTO getPropertyById(@PathVariable("id") Long id);
    
    @GetMapping("/api/properties/agent/{agentId}")
    Object getPropertiesByAgent(@PathVariable("agentId") Long agentId);
    
    @GetMapping("/api/properties/statistics")
    Map<String, Object> getPropertyStatistics();
    
    @GetMapping("/api/properties/search")
    Object searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size);
}

