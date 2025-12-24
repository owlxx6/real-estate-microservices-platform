package com.realestate.property.controller;

import com.realestate.property.dto.SalePropertyDTO;
import com.realestate.property.model.SaleProperty;
import com.realestate.property.service.SalePropertyService;
import com.realestate.property.util.RoleChecker;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
@Tag(name = "Sale Properties", description = "Property sale management APIs")
public class SalePropertyController {
    
    private final SalePropertyService salePropertyService;
    private final RoleChecker roleChecker;
    
    @GetMapping
    @Operation(summary = "Get all properties for sale")
    public ResponseEntity<List<SalePropertyDTO>> getAllForSale() {
        List<SalePropertyDTO> sales = salePropertyService.getAllForSale();
        return ResponseEntity.ok(sales);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get sale property by ID")
    public ResponseEntity<SalePropertyDTO> getSalePropertyById(@PathVariable Long id) {
        SalePropertyDTO sale = salePropertyService.getSalePropertyById(id);
        return ResponseEntity.ok(sale);
    }
    
    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get sale property by property ID")
    public ResponseEntity<SalePropertyDTO> getSalePropertyByPropertyId(@PathVariable Long propertyId) {
        SalePropertyDTO sale = salePropertyService.getSalePropertyByPropertyId(propertyId);
        return ResponseEntity.ok(sale);
    }
    
    @PostMapping
    @Operation(summary = "List a property for sale - AGENT/ADMIN only")
    public ResponseEntity<SalePropertyDTO> createSaleProperty(
            @Valid @RequestBody SaleProperty saleProperty,
            HttpServletRequest request) {
        roleChecker.checkAnyRole(request, RoleChecker.Role.AGENT, RoleChecker.Role.ADMIN);
        SalePropertyDTO created = salePropertyService.createSaleProperty(saleProperty);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update sale property - AGENT/ADMIN only")
    public ResponseEntity<SalePropertyDTO> updateSaleProperty(
            @PathVariable Long id,
            @Valid @RequestBody SaleProperty saleProperty,
            HttpServletRequest request) {
        roleChecker.checkAnyRole(request, RoleChecker.Role.AGENT, RoleChecker.Role.ADMIN);
        SalePropertyDTO updated = salePropertyService.updateSaleProperty(id, saleProperty);
        return ResponseEntity.ok(updated);
    }
    
    @PutMapping("/{id}/reserve")
    @Operation(summary = "Reserve a property (offer accepted) - AGENT/ADMIN only")
    public ResponseEntity<SalePropertyDTO> reserveSaleProperty(
            @PathVariable Long id,
            HttpServletRequest request) {
        roleChecker.checkAnyRole(request, RoleChecker.Role.AGENT, RoleChecker.Role.ADMIN);
        SalePropertyDTO reserved = salePropertyService.reserveSaleProperty(id);
        return ResponseEntity.ok(reserved);
    }
    
    @PutMapping("/{id}/sell")
    @Operation(summary = "Mark property as sold - AGENT/ADMIN only")
    public ResponseEntity<SalePropertyDTO> sellProperty(
            @PathVariable Long id,
            @RequestParam(required = false) BigDecimal finalPrice,
            HttpServletRequest request) {
        roleChecker.checkAnyRole(request, RoleChecker.Role.AGENT, RoleChecker.Role.ADMIN);
        SalePropertyDTO sold = salePropertyService.sellProperty(id, finalPrice);
        return ResponseEntity.ok(sold);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate sale listing - AGENT/ADMIN only")
    public ResponseEntity<Void> deactivateSaleProperty(
            @PathVariable Long id,
            HttpServletRequest request) {
        roleChecker.checkAnyRole(request, RoleChecker.Role.AGENT, RoleChecker.Role.ADMIN);
        salePropertyService.deactivateSaleProperty(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search properties for sale")
    public ResponseEntity<List<SalePropertyDTO>> searchForSale(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minRooms) {
        
        List<SalePropertyDTO> sales = salePropertyService.searchForSale(city, type, minPrice, maxPrice, minRooms);
        return ResponseEntity.ok(sales);
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get sale statistics - AGENT/ADMIN only")
    public ResponseEntity<Map<String, Object>> getStatistics(HttpServletRequest request) {
        roleChecker.checkAnyRole(request, RoleChecker.Role.AGENT, RoleChecker.Role.ADMIN);
        Map<String, Object> stats = salePropertyService.getStatistics();
        return ResponseEntity.ok(stats);
    }
}

