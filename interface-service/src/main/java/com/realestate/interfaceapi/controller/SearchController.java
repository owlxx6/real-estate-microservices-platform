package com.realestate.interfaceapi.controller;

import com.realestate.interfaceapi.dto.PropertyWithAgentDTO;
import com.realestate.interfaceapi.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Enhanced search APIs with data aggregation")
@CrossOrigin(origins = "*")
public class SearchController {
    
    private final SearchService searchService;
    
    @GetMapping("/properties")
    @Operation(summary = "Search properties with agent information")
    public ResponseEntity<List<PropertyWithAgentDTO>> searchPropertiesWithAgent(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        
        List<PropertyWithAgentDTO> results = searchService.searchPropertiesWithAgent(
                city, type, status, minPrice, maxPrice);
        return ResponseEntity.ok(results);
    }
    
    @GetMapping("/properties/{id}")
    @Operation(summary = "Get property with agent details")
    public ResponseEntity<PropertyWithAgentDTO> getPropertyWithAgent(@PathVariable Long id) {
        PropertyWithAgentDTO result = searchService.getPropertyWithAgent(id);
        return ResponseEntity.ok(result);
    }
}

