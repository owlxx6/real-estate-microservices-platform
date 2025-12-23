package com.realestate.client.controller;

import com.realestate.client.model.Visit;
import com.realestate.client.service.VisitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visits")
@RequiredArgsConstructor
@Tag(name = "Visits", description = "Visit management APIs")
public class VisitController {
    private final VisitService visitService;
    
    @GetMapping
    @Operation(summary = "Get all visits")
    public ResponseEntity<Page<Visit>> getAllVisits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(visitService.getAllVisits(PageRequest.of(page, size)));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get visit by ID")
    public ResponseEntity<Visit> getVisitById(@PathVariable Long id) {
        return ResponseEntity.ok(visitService.getVisitById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create a new visit")
    public ResponseEntity<Visit> createVisit(@Valid @RequestBody Visit visit) {
        return ResponseEntity.status(HttpStatus.CREATED).body(visitService.createVisit(visit));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update a visit")
    public ResponseEntity<Visit> updateVisit(@PathVariable Long id, @Valid @RequestBody Visit visit) {
        return ResponseEntity.ok(visitService.updateVisit(id, visit));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a visit")
    public ResponseEntity<Void> deleteVisit(@PathVariable Long id) {
        visitService.deleteVisit(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/client/{clientId}")
    @Operation(summary = "Get visits by client")
    public ResponseEntity<List<Visit>> getVisitsByClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(visitService.getVisitsByClient(clientId));
    }
    
    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get visits by property")
    public ResponseEntity<List<Visit>> getVisitsByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(visitService.getVisitsByProperty(propertyId));
    }
    
    @GetMapping("/recent")
    @Operation(summary = "Get recent visits")
    public ResponseEntity<List<Visit>> getRecentVisits(
            @RequestParam(defaultValue = "15") int days) {
        return ResponseEntity.ok(visitService.getRecentVisits(days));
    }
}
