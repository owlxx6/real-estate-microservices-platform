package com.realestate.interfaceapi.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(name = "property-service")
public interface PropertyServiceClient {
    
    @GetMapping("/api/properties/{id}")
    Map<String, Object> getPropertyById(@PathVariable Long id);
    
    @GetMapping("/api/properties/search")
    Map<String, Object> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String transactionType,
            @RequestParam(required = false) String status);
    
    @GetMapping("/api/properties/statistics")
    Map<String, Object> getPropertyStatistics();
    
    @GetMapping("/api/properties/agent/{agentId}")
    Map<String, Object> getPropertiesByAgent(@PathVariable Long agentId);
}
