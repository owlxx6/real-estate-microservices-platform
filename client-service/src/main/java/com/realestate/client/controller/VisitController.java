package com.realestate.client.controller;

import com.realestate.client.model.Visit;
import com.realestate.client.model.VisitStatus;
import com.realestate.client.service.VisitService;
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

import java.util.List;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
@Tag(name = "Visit Management", description = "APIs for managing property visits")
@CrossOrigin(origins = "*")
public class VisitController {
    
    private final VisitService visitService;
    
    @PostMapping
    @Operation(summary = "Create a new visit")
    public ResponseEntity<Visit> createVisit(@Valid @RequestBody Visit visit) {
        Visit createdVisit = visitService.createVisit(visit);
        return new ResponseEntity<>(createdVisit, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get visit by ID")
    public ResponseEntity<Visit> getVisitById(@PathVariable Long id) {
        Visit visit = visitService.getVisitById(id);
        return ResponseEntity.ok(visit);
    }
    
    @GetMapping
    @Operation(summary = "Get all visits with pagination")
    public ResponseEntity<Page<Visit>> getAllVisits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "visitDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Visit> visits = visitService.getAllVisits(pageable);
        return ResponseEntity.ok(visits);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing visit")
    public ResponseEntity<Visit> updateVisit(
            @PathVariable Long id,
            @Valid @RequestBody Visit visitDetails) {
        Visit updatedVisit = visitService.updateVisit(id, visitDetails);
        return ResponseEntity.ok(updatedVisit);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a visit")
    public ResponseEntity<Void> deleteVisit(@PathVariable Long id) {
        visitService.deleteVisit(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/client/{clientId}")
    @Operation(summary = "Get visits by client ID")
    public ResponseEntity<List<Visit>> getVisitsByClient(@PathVariable Long clientId) {
        List<Visit> visits = visitService.getVisitsByClient(clientId);
        return ResponseEntity.ok(visits);
    }
    
    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get visits by property ID")
    public ResponseEntity<List<Visit>> getVisitsByProperty(@PathVariable Long propertyId) {
        List<Visit> visits = visitService.getVisitsByProperty(propertyId);
        return ResponseEntity.ok(visits);
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get visits by status")
    public ResponseEntity<Page<Visit>> getVisitsByStatus(
            @PathVariable VisitStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Visit> visits = visitService.getVisitsByStatus(status, pageable);
        return ResponseEntity.ok(visits);
    }
    
    @GetMapping("/recent")
    @Operation(summary = "Get recent visits based on custom configuration (mes-config-ms.visits-last)")
    public ResponseEntity<List<Visit>> getRecentVisits() {
        List<Visit> visits = visitService.getRecentVisits();
        return ResponseEntity.ok(visits);
    }
}

