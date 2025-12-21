package com.realestate.property.controller;

import com.realestate.property.dto.PropertyDTO;
import com.realestate.property.dto.PropertyStatisticsDTO;
import com.realestate.property.model.Property;
import com.realestate.property.model.PropertyStatus;
import com.realestate.property.model.PropertyType;
import com.realestate.property.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@Tag(name = "Property Management", description = "APIs for managing real estate properties")
@CrossOrigin(origins = "*")
public class PropertyController {
    
    private final PropertyService propertyService;
    
    @PostMapping
    @Operation(summary = "Create a new property")
    public ResponseEntity<PropertyDTO> createProperty(@Valid @RequestBody Property property) {
        PropertyDTO createdProperty = propertyService.createProperty(property);
        return new ResponseEntity<>(createdProperty, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get property by ID")
    public ResponseEntity<PropertyDTO> getPropertyById(@PathVariable Long id) {
        PropertyDTO property = propertyService.getPropertyById(id);
        return ResponseEntity.ok(property);
    }
    
    @GetMapping
    @Operation(summary = "Get all properties with pagination")
    public ResponseEntity<Page<PropertyDTO>> getAllProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<PropertyDTO> properties = propertyService.getAllProperties(pageable);
        return ResponseEntity.ok(properties);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing property")
    public ResponseEntity<PropertyDTO> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody Property propertyDetails) {
        PropertyDTO updatedProperty = propertyService.updateProperty(id, propertyDetails);
        return ResponseEntity.ok(updatedProperty);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a property")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Advanced property search with multiple filters")
    public ResponseEntity<Page<PropertyDTO>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) PropertyType type,
            @RequestParam(required = false) PropertyStatus status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minRooms,
            @RequestParam(required = false) Integer maxRooms,
            @RequestParam(required = false) Integer minSurface,
            @RequestParam(required = false) Integer maxSurface,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<PropertyDTO> properties = propertyService.searchProperties(
                city, type, status, minPrice, maxPrice,
                minRooms, maxRooms, minSurface, maxSurface, pageable);
        
        return ResponseEntity.ok(properties);
    }
    
    @GetMapping("/agent/{agentId}")
    @Operation(summary = "Get all properties for a specific agent")
    public ResponseEntity<List<PropertyDTO>> getPropertiesByAgent(@PathVariable Long agentId) {
        List<PropertyDTO> properties = propertyService.getPropertiesByAgent(agentId);
        return ResponseEntity.ok(properties);
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get property statistics and analytics")
    public ResponseEntity<PropertyStatisticsDTO> getPropertyStatistics() {
        PropertyStatisticsDTO statistics = propertyService.getPropertyStatistics();
        return ResponseEntity.ok(statistics);
    }
}

