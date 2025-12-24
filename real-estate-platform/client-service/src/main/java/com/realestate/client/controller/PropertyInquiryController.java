package com.realestate.client.controller;

import com.realestate.client.model.PropertyInquiry;
import com.realestate.client.service.PropertyInquiryService;
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
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
@Tag(name = "Property Inquiries", description = "Property inquiry management APIs")
public class PropertyInquiryController {
    private final PropertyInquiryService inquiryService;
    
    @GetMapping
    @Operation(summary = "Get all inquiries")
    public ResponseEntity<Page<PropertyInquiry>> getAllInquiries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(inquiryService.getAllInquiries(PageRequest.of(page, size)));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get inquiry by ID")
    public ResponseEntity<PropertyInquiry> getInquiryById(@PathVariable Long id) {
        return ResponseEntity.ok(inquiryService.getInquiryById(id));
    }
    
    @PostMapping
    @Operation(summary = "Create a new inquiry")
    public ResponseEntity<PropertyInquiry> createInquiry(@Valid @RequestBody PropertyInquiry inquiry) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inquiryService.createInquiry(inquiry));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update an inquiry")
    public ResponseEntity<PropertyInquiry> updateInquiry(
            @PathVariable Long id, 
            @Valid @RequestBody PropertyInquiry inquiry) {
        return ResponseEntity.ok(inquiryService.updateInquiry(id, inquiry));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an inquiry")
    public ResponseEntity<Void> deleteInquiry(@PathVariable Long id) {
        inquiryService.deleteInquiry(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get inquiries by property")
    public ResponseEntity<List<PropertyInquiry>> getInquiriesByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(inquiryService.getInquiriesByProperty(propertyId));
    }
    
    @GetMapping("/agent/{agentId}")
    @Operation(summary = "Get inquiries by agent")
    public ResponseEntity<List<PropertyInquiry>> getInquiriesByAgent(@PathVariable Long agentId) {
        return ResponseEntity.ok(inquiryService.getInquiriesByAgent(agentId));
    }
    
    @GetMapping("/email/{email}")
    @Operation(summary = "Get inquiries by client email")
    public ResponseEntity<List<PropertyInquiry>> getInquiriesByEmail(@PathVariable String email) {
        return ResponseEntity.ok(inquiryService.getInquiriesByEmail(email));
    }
}

