package com.realestate.property.controller;

import com.realestate.property.dto.PropertyDTO;
import com.realestate.property.model.Property;
import com.realestate.property.model.Property.*;
import com.realestate.property.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@Tag(name = "Properties", description = "Property management APIs - Sale and Rental")
@CrossOrigin(origins = "*")
public class PropertyController {
    
    private final PropertyService propertyService;
    
    @GetMapping
    @Operation(summary = "Get all properties with pagination")
    public ResponseEntity<Page<PropertyDTO>> getAllProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? 
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<PropertyDTO> properties = propertyService.getAllProperties(PageRequest.of(page, size, sort));
        return ResponseEntity.ok(properties);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get property by ID")
    public ResponseEntity<PropertyDTO> getPropertyById(@PathVariable Long id) {
        PropertyDTO property = propertyService.getPropertyById(id);
        return ResponseEntity.ok(property);
    }
    
    @PostMapping
    @Operation(summary = "Create a new property")
    public ResponseEntity<PropertyDTO> createProperty(@Valid @RequestBody Property property) {
        PropertyDTO created = propertyService.createProperty(property);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update a property")
    public ResponseEntity<PropertyDTO> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody Property property) {
        PropertyDTO updated = propertyService.updateProperty(id, property);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a property")
    public ResponseEntity<Void> deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search properties with filters")
    public ResponseEntity<Page<PropertyDTO>> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) PropertyType type,
            @RequestParam(required = false) TransactionType transactionType,
            @RequestParam(required = false) PropertyStatus status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minRooms,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PropertyDTO> properties = propertyService.searchProperties(
                city, type, transactionType, status, minPrice, maxPrice, minRooms,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(properties);
    }
    
    @GetMapping("/agent/{agentId}")
    @Operation(summary = "Get properties by agent ID")
    public ResponseEntity<Page<PropertyDTO>> getPropertiesByAgent(
            @PathVariable Long agentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PropertyDTO> properties = propertyService.getPropertiesByAgent(
                agentId, PageRequest.of(page, size));
        return ResponseEntity.ok(properties);
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get property statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> stats = propertyService.getStatistics();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/for-sale")
    @Operation(summary = "Get properties for sale")
    public ResponseEntity<Page<PropertyDTO>> getPropertiesForSale(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PropertyDTO> properties = propertyService.searchProperties(
                null, null, TransactionType.SALE, PropertyStatus.AVAILABLE, null, null, null,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(properties);
    }
    
    @GetMapping("/for-rent")
    @Operation(summary = "Get properties for rent")
    public ResponseEntity<Page<PropertyDTO>> getPropertiesForRent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Page<PropertyDTO> properties = propertyService.searchProperties(
                null, null, TransactionType.RENTAL, PropertyStatus.AVAILABLE, null, null, null,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(properties);
    }
}

