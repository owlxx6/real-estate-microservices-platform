package com.realestate.rental.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "property-service")
public interface PropertyServiceClient {
    
    @GetMapping("/api/properties/{id}")
    Map<String, Object> getPropertyById(@PathVariable Long id);
}

