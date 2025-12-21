package com.realestate.client.controller;

import com.realestate.client.dto.AgentPortfolioDTO;
import com.realestate.client.model.Agent;
import com.realestate.client.service.AgentService;
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

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
@Tag(name = "Agent Management", description = "APIs for managing real estate agents")
@CrossOrigin(origins = "*")
public class AgentController {
    
    private final AgentService agentService;
    
    @PostMapping
    @Operation(summary = "Create a new agent")
    public ResponseEntity<Agent> createAgent(@Valid @RequestBody Agent agent) {
        Agent createdAgent = agentService.createAgent(agent);
        return new ResponseEntity<>(createdAgent, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get agent by ID")
    public ResponseEntity<Agent> getAgentById(@PathVariable Long id) {
        Agent agent = agentService.getAgentById(id);
        return ResponseEntity.ok(agent);
    }
    
    @GetMapping
    @Operation(summary = "Get all agents with pagination")
    public ResponseEntity<Page<Agent>> getAllAgents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") 
                ? Sort.by(sortBy).ascending() 
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Agent> agents = agentService.getAllAgents(pageable);
        return ResponseEntity.ok(agents);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing agent")
    public ResponseEntity<Agent> updateAgent(
            @PathVariable Long id,
            @Valid @RequestBody Agent agentDetails) {
        Agent updatedAgent = agentService.updateAgent(id, agentDetails);
        return ResponseEntity.ok(updatedAgent);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an agent")
    public ResponseEntity<Void> deleteAgent(@PathVariable Long id) {
        agentService.deleteAgent(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/properties")
    @Operation(summary = "Get agent portfolio with properties using OpenFeign")
    public ResponseEntity<AgentPortfolioDTO> getAgentPortfolio(@PathVariable Long id) {
        AgentPortfolioDTO portfolio = agentService.getAgentPortfolio(id);
        return ResponseEntity.ok(portfolio);
    }
}

